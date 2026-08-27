import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../api.js';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  PageHeader,
  Panel,
  Select,
  Spinner,
  formatDate,
  formatSize,
  useToast,
} from '../components/ui.jsx';

const TYPES = [
  { value: 'datasheet', label: 'Техпаспорт' },
  { value: 'manual', label: 'Руководство' },
  { value: 'certificate', label: 'Сертификат' },
  { value: 'other', label: 'Прочее' },
];

export default function Documents({ user }) {
  const [documents, setDocuments] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [draft, setDraft] = useState({ title: '', productId: '', type: 'datasheet' });
  const fileRef = useRef(null);
  const replaceRef = useRef(null);
  const [replacingId, setReplacingId] = useState(null);
  const notify = useToast();

  const readOnly = user.role === 'viewer';

  const load = () => {
    setError(null);
    adminApi.documents().then(setDocuments).catch(setError);
  };

  useEffect(() => {
    load();
    adminApi.products().then(setProducts).catch(() => {});
  }, []);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      await adminApi.uploadDocument({
        file,
        title: draft.title || file.name,
        productId: draft.productId || null,
        type: draft.type,
      });

      setDraft({ title: '', productId: '', type: 'datasheet' });
      load();
      notify('Документ загружен как черновик');
    } catch (uploadError) {
      notify(uploadError.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const replaceFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !replacingId) return;

    try {
      await adminApi.replaceDocumentFile(replacingId, file);
      load();
      notify('Файл заменён');
    } catch (replaceError) {
      notify(replaceError.message, 'error');
    } finally {
      setReplacingId(null);
    }
  };

  const patch = async (id, body, message) => {
    try {
      await adminApi.updateDocument(id, body);
      load();
      if (message) notify(message);
    } catch (patchError) {
      notify(patchError.message, 'error');
    }
  };

  const remove = async () => {
    const document = confirming;
    setConfirming(null);

    try {
      await adminApi.deleteDocument(document.id);
      load();
      notify('Документ удалён');
    } catch (deleteError) {
      notify(deleteError.message, 'error');
    }
  };

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!documents) return <Spinner />;

  return (
    <>
      <PageHeader title="Документация" description="PDF-файлы, привязанные к товарам" />

      {!readOnly && (
        <Panel title="Загрузить документ" className="mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <label className="block space-y-1.5 md:col-span-2">
              <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Название
              </span>
              <Input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="Пусто — возьмём имя файла"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Товар
              </span>
              <Select
                value={draft.productId}
                onChange={(event) => setDraft({ ...draft, productId: event.target.value })}
              >
                <option value="">— без привязки —</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-1.5">
              <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Тип
              </span>
              <Select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}>
                {TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <Button
            variant="primary"
            icon="upload_file"
            className="mt-4"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Загружаем…' : 'Выбрать PDF'}
          </Button>
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={upload} />
        </Panel>
      )}

      <input ref={replaceRef} type="file" accept="application/pdf" className="hidden" onChange={replaceFile} />

      {documents.length === 0 ? (
        <EmptyState
          icon="picture_as_pdf"
          title="Документов нет"
          description="Загруженные PDF появятся на странице товара после публикации."
        />
      ) : (
        <div className="space-y-2">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex flex-wrap items-center gap-3 rounded-sm border border-outline-variant/60 bg-surface/40 px-4 py-3"
            >
              <span className="material-symbols-outlined text-2xl text-primary">picture_as_pdf</span>

              <div className="min-w-0 flex-1">
                <div className="truncate font-label-md text-label-md text-white">{document.title}</div>
                <div className="font-label-sm text-[11px] text-outline">
                  {formatSize(document.file_size)} · {TYPES.find((type) => type.value === document.type)?.label ?? document.type}
                  {' · '}
                  {formatDate(document.created_at)}
                </div>
              </div>

              {document.product_name ? (
                <Badge>{document.product_name}</Badge>
              ) : (
                <Badge tone="warning">Без товара</Badge>
              )}

              <Badge tone={document.status === 'published' ? 'success' : 'neutral'}>
                {document.status === 'published' ? 'Опубликован' : 'Черновик'}
              </Badge>

              <div className="flex items-center gap-1">
                <IconButton
                  icon="download"
                  title="Открыть файл"
                  onClick={() => window.open(document.file_path, '_blank', 'noopener')}
                />

                {!readOnly && (
                  <>
                    <IconButton
                      icon={document.status === 'published' ? 'visibility_off' : 'publish'}
                      title={document.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}
                      onClick={() =>
                        patch(
                          document.id,
                          { status: document.status === 'published' ? 'draft' : 'published' },
                          document.status === 'published' ? 'Снят с публикации' : 'Опубликован',
                        )
                      }
                    />
                    <IconButton
                      icon="swap_horiz"
                      title="Заменить файл"
                      onClick={() => {
                        setReplacingId(document.id);
                        replaceRef.current?.click();
                      }}
                    />
                    <IconButton icon="delete" title="Удалить" onClick={() => setConfirming(document)} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title={`Удалить «${confirming?.title}»?`}
        description="Запись удалится, сам файл останется в медиатеке."
        onConfirm={remove}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
