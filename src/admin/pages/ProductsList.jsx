import { useEffect, useState } from 'react';
import { adminApi } from '../api.js';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  PageHeader,
  Spinner,
  useToast,
} from '../components/ui.jsx';

const canEdit = (role) => role === 'admin' || role === 'editor';

export default function ProductsList({ user, navigate }) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const notify = useToast();

  const editable = canEdit(user.role);

  const load = () => {
    setError(null);
    adminApi.products().then(setProducts).catch(setError);
  };

  useEffect(load, []);

  const toggleStatus = async (product) => {
    const next = product.status === 'published' ? 'draft' : 'published';

    try {
      await adminApi.setProductStatus(product.id, next);
      setProducts((current) => current.map((item) => (item.id === product.id ? { ...item, status: next } : item)));
      notify(next === 'published' ? 'Товар опубликован' : 'Товар снят с публикации');
    } catch (statusError) {
      notify(statusError.message, 'error');
    }
  };

  /** Перемещение на одну позицию с сохранением нового порядка на сервере. */
  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= products.length) return;

    const reordered = [...products];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    setProducts(reordered);

    try {
      await adminApi.reorderProducts(reordered.map((product, position) => ({ id: product.id, sort: position })));
    } catch (moveError) {
      notify(moveError.message, 'error');
      load();
    }
  };

  const remove = async () => {
    const product = confirming;
    setConfirming(null);

    try {
      await adminApi.deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      notify('Товар удалён');
    } catch (deleteError) {
      notify(deleteError.message, 'error');
    }
  };

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!products) return <Spinner />;

  return (
    <>
      <PageHeader title="Товары" description={`${products.length} позиций в каталоге`}>
        {editable && (
          <Button variant="primary" icon="add" onClick={() => navigate('/admin/products/new')}>
            Добавить товар
          </Button>
        )}
      </PageHeader>

      {products.length === 0 ? (
        <EmptyState
          icon="inventory_2"
          title="Каталог пуст"
          description="Добавьте первый товар — он появится на сайте после публикации."
        >
          {editable && (
            <Button variant="primary" icon="add" className="mt-2" onClick={() => navigate('/admin/products/new')}>
              Добавить товар
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-hairline-soft">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-hairline-soft bg-part-fill">
                <th className="w-20 px-3 py-3"></th>
                <th className="px-3 py-3 text-left font-label-2xs text-label-2xs uppercase text-ink-quiet">
                  Товар
                </th>
                <th className="hidden px-3 py-3 text-left font-label-2xs text-label-2xs uppercase text-ink-quiet md:table-cell">
                  Категория
                </th>
                <th className="hidden px-3 py-3 text-center font-label-2xs text-label-2xs uppercase text-ink-quiet lg:table-cell">
                  ТТХ
                </th>
                <th className="hidden px-3 py-3 text-center font-label-2xs text-label-2xs uppercase text-ink-quiet lg:table-cell">
                  Документы
                </th>
                <th className="px-3 py-3 text-left font-label-2xs text-label-2xs uppercase text-ink-quiet">
                  Статус
                </th>
                <th className="w-32 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} className="border-b border-hairline-soft last:border-0">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {editable && (
                        <div className="flex flex-col">
                          <IconButton
                            icon="keyboard_arrow_up"
                            title="Выше"
                            className="h-5 w-5"
                            disabled={index === 0}
                            onClick={() => move(index, -1)}
                          />
                          <IconButton
                            icon="keyboard_arrow_down"
                            title="Ниже"
                            className="h-5 w-5"
                            disabled={index === products.length - 1}
                            onClick={() => move(index, 1)}
                          />
                        </div>
                      )}
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-part-fill">
                        {product.main_image ? (
                          <img src={product.main_image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-stencil-dim">
                            <span className="material-symbols-outlined text-[16px]">image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <a
                      href={`/admin/products/${product.id}`}
                      className="font-body-md text-[15px] text-ink hover:text-stencil"
                    >
                      {product.name}
                    </a>
                    <div className="font-label-xs text-label-xs text-ink-quiet">/{product.slug}</div>
                  </td>

                  <td className="hidden px-3 py-3 font-body-md text-[15px] text-ink-dim md:table-cell">
                    {product.category ?? '—'}
                  </td>

                  <td className="hidden px-3 py-3 text-center font-label-md text-label-md text-ink-dim lg:table-cell">
                    {product.specs_count}
                  </td>

                  <td className="hidden px-3 py-3 text-center font-label-md text-label-md text-ink-dim lg:table-cell">
                    {product.documents_count}
                  </td>

                  <td className="px-3 py-3">
                    <Badge tone={product.status === 'published' ? 'success' : 'neutral'}>
                      {product.status === 'published' ? 'Опубликован' : 'Черновик'}
                    </Badge>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {product.status === 'published' && (
                        <IconButton
                          icon="open_in_new"
                          title="Открыть на сайте"
                          onClick={() => window.open(`/products/${product.slug}`, '_blank', 'noopener')}
                        />
                      )}
                      {editable && (
                        <>
                          <IconButton
                            icon={product.status === 'published' ? 'visibility_off' : 'publish'}
                            title={product.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}
                            onClick={() => toggleStatus(product)}
                          />
                          <IconButton icon="delete" title="Удалить" onClick={() => setConfirming(product)} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title={`Удалить «${confirming?.name}»?`}
        description="Вместе с товаром удалятся его характеристики, галерея и привязанные документы. Действие необратимо."
        onConfirm={remove}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
