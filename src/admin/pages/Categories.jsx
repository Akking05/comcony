import { useEffect, useState } from 'react';
import { adminApi } from '../api.js';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  PageHeader,
  Spinner,
  Textarea,
  useToast,
} from '../components/ui.jsx';

export default function Categories({ user }) {
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const notify = useToast();

  const readOnly = user.role === 'viewer';

  const load = () => {
    setError(null);
    adminApi.categories().then(setCategories).catch(setError);
  };

  useEffect(load, []);

  const save = async () => {
    if (!editing.name.trim()) {
      notify('Укажите название', 'error');
      return;
    }

    try {
      if (editing.id) {
        await adminApi.updateCategory(editing.id, editing);
      } else {
        await adminApi.createCategory(editing);
      }

      setEditing(null);
      load();
      notify('Сохранено');
    } catch (saveError) {
      notify(saveError.message, 'error');
    }
  };

  const remove = async () => {
    const category = confirming;
    setConfirming(null);

    try {
      await adminApi.deleteCategory(category.id);
      load();
      notify('Категория удалена');
    } catch (deleteError) {
      notify(deleteError.message, 'error');
    }
  };

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!categories) return <Spinner />;

  return (
    <>
      <PageHeader title="Категории" description={`${categories.length} категорий`}>
        {!readOnly && (
          <Button variant="primary" icon="add" onClick={() => setEditing({ name: '', slug: '', description: '' })}>
            Добавить
          </Button>
        )}
      </PageHeader>

      {categories.length === 0 ? (
        <EmptyState icon="category" title="Категорий нет" description="Категории группируют товары в каталоге." />
      ) : (
        <div className="overflow-x-auto rounded-sm border border-outline-variant/60">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/60 bg-surface/60">
                <th className="px-4 py-3 text-left font-label-sm text-[10px] uppercase tracking-widest text-outline">
                  Название
                </th>
                <th className="hidden px-4 py-3 text-left font-label-sm text-[10px] uppercase tracking-widest text-outline md:table-cell">
                  Адрес
                </th>
                <th className="px-4 py-3 text-center font-label-sm text-[10px] uppercase tracking-widest text-outline">
                  Товаров
                </th>
                <th className="w-24 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-outline-variant/30 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-label-md text-label-md text-white">{category.name}</div>
                    {category.description && (
                      <div className="mt-0.5 font-body-md text-[13px] text-on-surface-variant">
                        {category.description}
                      </div>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 font-label-sm text-[11px] text-outline md:table-cell">
                    /{category.slug}
                  </td>
                  <td className="px-4 py-3 text-center font-label-md text-label-md text-on-surface-variant">
                    {category.products_count}
                  </td>
                  <td className="px-4 py-3">
                    {!readOnly && (
                      <div className="flex justify-end gap-1">
                        <IconButton icon="edit" title="Изменить" onClick={() => setEditing({ ...category })} />
                        <IconButton icon="delete" title="Удалить" onClick={() => setConfirming(category)} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditing(null)}></div>
          <div className="relative w-full max-w-lg rounded-sm border border-outline-variant bg-surface p-6">
            <h2 className="mb-5 font-headline-md text-[18px] text-white">
              {editing.id ? 'Изменить категорию' : 'Новая категория'}
            </h2>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Название <span className="text-primary">*</span>
                </span>
                <Input
                  autoFocus
                  value={editing.name}
                  onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                  placeholder="Носимые радиостанции"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Адрес
                </span>
                <Input
                  value={editing.slug ?? ''}
                  onChange={(event) => setEditing({ ...editing, slug: event.target.value })}
                  placeholder="Оставьте пустым — сгенерируется"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Описание
                </span>
                <Textarea
                  rows={3}
                  value={editing.description ?? ''}
                  onChange={(event) => setEditing({ ...editing, description: event.target.value })}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Отмена
              </Button>
              <Button variant="primary" icon="save" onClick={save}>
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title={`Удалить «${confirming?.name}»?`}
        description={
          confirming?.products_count
            ? `Товары (${confirming.products_count} шт.) останутся, но потеряют категорию.`
            : 'Категория пуста, товары не пострадают.'
        }
        onConfirm={remove}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
