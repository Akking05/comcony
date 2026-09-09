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
import { LangTabs, translatable } from '../lib/translatable.jsx';

export default function Categories({ user }) {
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [lang, setLang] = useState('ru');
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
      // Обязательно только русское название — возвращаем на его вкладку.
      setLang('ru');
      notify('Укажите название по-русски', 'error');
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
          <Button
            variant="primary"
            icon="add"
            onClick={() => {
              setLang('ru');
              setEditing({ name: '', name_en: '', slug: '', description: '', description_en: '' });
            }}
          >
            Добавить
          </Button>
        )}
      </PageHeader>

      {categories.length === 0 ? (
        <EmptyState icon="category" title="Категорий нет" description="Категории группируют товары в каталоге." />
      ) : (
        <div className="overflow-x-auto rounded-sm border border-hairline-soft">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-hairline-soft bg-part-fill">
                <th className="px-4 py-3 text-left font-label-2xs text-label-2xs uppercase text-ink-quiet">
                  Название
                </th>
                <th className="hidden px-4 py-3 text-left font-label-2xs text-label-2xs uppercase text-ink-quiet md:table-cell">
                  Адрес
                </th>
                <th className="px-4 py-3 text-center font-label-2xs text-label-2xs uppercase text-ink-quiet">
                  Товаров
                </th>
                <th className="w-24 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-hairline-soft last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-body-md text-[15px] text-ink">{category.name}</div>
                    {category.description && (
                      <div className="mt-0.5 font-body-md text-[13px] text-ink-dim">
                        {category.description}
                      </div>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 font-label-xs text-label-xs text-ink-quiet md:table-cell">
                    /{category.slug}
                  </td>
                  <td className="px-4 py-3 text-center font-label-md text-label-md text-ink-dim">
                    {category.products_count}
                  </td>
                  <td className="px-4 py-3">
                    {!readOnly && (
                      <div className="flex justify-end gap-1">
                        <IconButton
                          icon="edit"
                          title="Изменить"
                          onClick={() => {
                            setLang('ru');
                            setEditing({ ...category });
                          }}
                        />
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
          <div className="absolute inset-0 bg-background/80" onClick={() => setEditing(null)}></div>
          <div className="relative w-full max-w-lg rounded-sm border border-hairline bg-ground p-6">
            <h2 className="mb-5 font-title-md text-[18px] uppercase text-ink">
              {editing.id ? 'Изменить категорию' : 'Новая категория'}
            </h2>

            {/* Адрес от языка не зависит и остаётся общим для обеих вкладок. */}
            <LangTabs lang={lang} onChange={setLang} className="mb-5" />

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="block font-label-md text-label-md uppercase text-ink-dim">
                  Название {lang === 'ru' && <span className="text-stencil">*</span>}
                </span>
                <Input
                  autoFocus
                  {...translatable(editing, 'name', lang, (patch) => setEditing({ ...editing, ...patch }), 'Носимые радиостанции')}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="block font-label-md text-label-md uppercase text-ink-dim">
                  Адрес
                </span>
                <Input
                  value={editing.slug ?? ''}
                  onChange={(event) => setEditing({ ...editing, slug: event.target.value })}
                  placeholder="Оставьте пустым — сгенерируется"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="block font-label-md text-label-md uppercase text-ink-dim">
                  Описание
                </span>
                <Textarea
                  rows={3}
                  {...translatable(editing, 'description', lang, (patch) => setEditing({ ...editing, ...patch }))}
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
