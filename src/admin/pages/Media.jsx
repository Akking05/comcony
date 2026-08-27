import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../api.js';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  PageHeader,
  Spinner,
  formatDate,
  formatSize,
  useToast,
} from '../components/ui.jsx';

const isImage = (path) => /\.(webp|jpe?g|png|svg)$/i.test(path);

export default function Media({ user }) {
  const [files, setFiles] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const notify = useToast();

  const readOnly = user.role === 'viewer';

  const load = () => {
    setError(null);
    adminApi.media().then(setFiles).catch(setError);
  };

  useEffect(load, []);

  const upload = async (event) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!selected.length) return;

    setUploading(true);
    try {
      const results = await Promise.all(selected.map((file) => adminApi.upload(file)));
      const reused = results.filter((result) => result.reused).length;

      load();
      notify(
        reused
          ? `Загружено ${results.length}, из них уже были в медиатеке: ${reused}`
          : `Загружено файлов: ${results.length}`,
      );
    } catch (uploadError) {
      notify(uploadError.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    const file = confirming;
    setConfirming(null);

    try {
      await adminApi.deleteMedia(file.path);
      load();
      notify('Файл удалён');
    } catch (deleteError) {
      notify(deleteError.message, 'error');
    }
  };

  const copyPath = async (path) => {
    try {
      await navigator.clipboard.writeText(path);
      notify('Путь скопирован');
    } catch {
      notify('Не удалось скопировать', 'error');
    }
  };

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!files) return <Spinner />;

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <>
      <PageHeader title="Медиа" description={`${files.length} файлов, ${formatSize(totalSize)}`}>
        {!readOnly && (
          <Button variant="primary" icon="upload" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? 'Загружаем…' : 'Загрузить'}
          </Button>
        )}
      </PageHeader>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/webp,image/jpeg,image/png,image/svg+xml,application/pdf"
        className="hidden"
        onChange={upload}
      />

      <p className="mb-5 flex items-start gap-2 rounded-sm border border-outline-variant/40 bg-surface/30 px-4 py-3 font-body-md text-body-md text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px] text-primary">info</span>
        Имя файла — отпечаток его содержимого, поэтому один и тот же файл не занимает место дважды. Файл, на который
        ссылается товар, документ или сотрудник, удалить нельзя.
      </p>

      {files.length === 0 ? (
        <EmptyState icon="perm_media" title="Медиатека пуста" description="Загрузите изображения и PDF." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {files.map((file) => (
            <div key={file.path} className="overflow-hidden rounded-sm border border-outline-variant/60 bg-surface/40">
              <div className="aspect-square bg-surface-container-high">
                {isImage(file.path) ? (
                  <img src={file.path} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary/50">
                    <span className="material-symbols-outlined text-4xl">picture_as_pdf</span>
                  </div>
                )}
              </div>

              <div className="p-2.5">
                <div className="truncate font-label-sm text-[11px] text-on-surface-variant" title={file.path}>
                  {file.path.replace('/uploads/', '')}
                </div>
                <div className="font-label-sm text-[10px] text-outline">
                  {formatSize(file.size)} · {formatDate(file.modified_at).split(',')[0]}
                </div>

                <div className="mt-1.5 flex justify-end gap-0.5">
                  <IconButton
                    icon="content_copy"
                    title="Скопировать путь"
                    className="h-7 w-7"
                    onClick={() => copyPath(file.path)}
                  />
                  <IconButton
                    icon="open_in_new"
                    title="Открыть"
                    className="h-7 w-7"
                    onClick={() => window.open(file.path, '_blank', 'noopener')}
                  />
                  {!readOnly && (
                    <IconButton
                      icon="delete"
                      title="Удалить"
                      className="h-7 w-7"
                      onClick={() => setConfirming(file)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title="Удалить файл?"
        description="Если файл где-то используется, сервер откажет в удалении."
        onConfirm={remove}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
