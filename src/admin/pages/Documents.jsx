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
  const [draft, setDraft] = useState({ title: '', title_en: '', productId: '', type: 'datasheet' });
  // Названия документа раньше нельзя было исправить после загрузки. Теперь
  // строка раскрывается в две — русскую и английскую.
  const [renaming, setRenaming] = useState(null);
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
        title_en: draft.title_en,
        productId: draft.productId || null,
        type: draft.type,
      });

      setDraft({ title: '', title_en: '', productId: '', type: 'datasheet' });
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
            <label className="block space-y-1.5">
              <span className="block font-label-md text-label-md uppercase text-ink-dim">
                Название
              </span>
              <Input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="Пусто — возьмём имя файла"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="block font-label-md text-label-md uppercase text-ink-dim">
                Название (English)
              </span>
              <Input
                lang="en"
                value={draft.title_en}
                onChange={(event) => setDraft({ ...draft, title_en: event.target.value })}
                placeholder={draft.title || 'Пусто — покажем русское'}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="block font-label-md text-label-md uppercase text-ink-dim">
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
              <span className="block font-label-md text-label-md uppercase text-ink-dim">
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
              className="flex flex-wrap items-center gap-3 rounded-sm border border-hairline-soft bg-part-fill px-4 py-3"
            >
              <span className="material-symbols-outlined text-2xl text-stencil">picture_as_pdf</span>

              <div className="min-w-0 flex-1">
                {renaming?.id === document.id ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      autoFocus
                      value={renaming.title}
                      onChange={(event) => setRenaming({ ...renaming, title: event.target.value })}
                      placeholder="Название"
                    />
                    <Input
                      lang="en"
                      value={renaming.title_en}
                      onChange={(event) => setRenaming({ ...renaming, title_en: event.target.value })}
                      placeholder={renaming.title || 'English'}
                    />
                  </div>
                ) : (
                  <>
                    <div className="truncate font-body-md text-[15px] text-ink">{document.title}</div>
                    <div className="font-label-xs text-label-xs text-ink-quiet">
                      {document.title_en && <span className="text-ink-dim">{document.title_en} · </span>}
                      {formatSize(document.file_size)} ·{' '}
                      {TYPES.find((type) => type.value === document.type)?.label ?? document.type}
                      {' · '}
                      {formatDate(document.created_at)}
                    </div>
                  </>
                )}
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

                {!readOnly && renaming?.id === document.id && (
                  <>
                    <IconButton
                      icon="check"
                      title="Сохранить названия"
                      onClick={() => {
                        patch(document.id, { title: renaming.title, title_en: renaming.title_en }, 'Название обновлено');
                        setRenaming(null);
                      }}
                    />
                    <IconButton icon="close" title="Отмена" onClick={() => setRenaming(null)} />
                  </>
                )}

                {!readOnly && renaming?.id !== document.id && (
                  <>
                    <IconButton
                      icon="edit"
                      title="Переименовать"
                      onClick={() =>
                        setRenaming({
                          id: document.id,
                          title: document.title,
                          title_en: document.title_en ?? '',
                        })
                      }
                    />
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
