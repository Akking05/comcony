import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../api.js';
import {
  Badge,
  Button,
  ConfirmDialog,
  Field,
  IconButton,
  Input,
  PageHeader,
  Panel,
  Select,
  Spinner,
  Textarea,
  useToast,
} from '../components/ui.jsx';

const EMPTY = {
  name: '',
  slug: '',
  category_id: '',
  short_description: '',
  full_description: '',
  main_image: '',
  badge: '',
  status: 'draft',
  specs: [],
  gallery: [],
  applications: [],
};

/** Загрузка файла в медиатеку с превью выбранного значения. */
function ImagePicker({ label, value, onChange, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  const pick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      const uploaded = await adminApi.upload(file);
      onChange(uploaded.path);
      notify(uploaded.reused ? 'Файл уже был в медиатеке — переиспользован' : 'Файл загружен');
    } catch (uploadError) {
      notify(uploadError.message, 'error');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-start gap-3">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-surface-container-high">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-outline/40">
              <span className="material-symbols-outlined">image</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/uploads/… или внешний URL"
          />
          <div className="flex gap-2">
            <Button icon="upload" disabled={busy} onClick={() => inputRef.current?.click()}>
              {busy ? 'Загрузка…' : 'Загрузить'}
            </Button>
            {value && (
              <Button variant="ghost" icon="close" onClick={() => onChange('')}>
                Убрать
              </Button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/webp,image/jpeg,image/png,image/svg+xml"
            className="hidden"
            onChange={pick}
          />
        </div>
      </div>
    </Field>
  );
}

/**
 * Редактор характеристик. Строки полностью произвольные: группа, название,
 * значение. Ключевые попадают в верхний блок страницы товара.
 */
function SpecsEditor({ specs, onChange }) {
  const update = (index, patch) =>
    onChange(specs.map((spec, position) => (position === index ? { ...spec, ...patch } : spec)));

  const remove = (index) => onChange(specs.filter((_, position) => position !== index));

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= specs.length) return;

    const next = [...specs];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () =>
    onChange([...specs, { spec_group: specs.at(-1)?.spec_group ?? '', name: '', value: '', is_key: 0 }]);

  return (
    <div className="space-y-3">
      {specs.length === 0 && (
        <p className="rounded-sm border border-dashed border-outline-variant/60 px-4 py-6 text-center font-body-md text-body-md text-on-surface-variant">
          Характеристик пока нет. Группа и название — произвольные:
          <br />
          <span className="text-outline">Optical → Detection Range → 12 km</span>
        </p>
      )}

      {specs.map((spec, index) => (
        <div
          key={index}
          className="grid grid-cols-1 gap-2 rounded-sm border border-outline-variant/40 bg-surface/30 p-3 md:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <Input
            value={spec.spec_group ?? ''}
            onChange={(event) => update(index, { spec_group: event.target.value })}
            placeholder="Группа (Optical)"
          />
          <Input
            value={spec.name}
            onChange={(event) => update(index, { name: event.target.value })}
            placeholder="Название (Detection Range)"
          />
          <Input
            value={spec.value}
            onChange={(event) => update(index, { value: event.target.value })}
            placeholder="Значение (12 km)"
          />

          <div className="flex items-center justify-end gap-1">
            <label
              title="Показать в блоке ключевых характеристик"
              className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-sm px-2 transition-colors ${
                spec.is_key ? 'bg-primary/15 text-primary' : 'text-outline hover:bg-white/5'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={Boolean(spec.is_key)}
                onChange={(event) => update(index, { is_key: event.target.checked ? 1 : 0 })}
              />
              <span className="material-symbols-outlined text-[18px]">
                {spec.is_key ? 'star' : 'star_border'}
              </span>
            </label>
            <IconButton icon="keyboard_arrow_up" title="Выше" disabled={index === 0} onClick={() => move(index, -1)} />
            <IconButton
              icon="keyboard_arrow_down"
              title="Ниже"
              disabled={index === specs.length - 1}
              onClick={() => move(index, 1)}
            />
            <IconButton icon="delete" title="Удалить" onClick={() => remove(index)} />
          </div>
        </div>
      ))}

      <Button icon="add" onClick={add}>
        Добавить характеристику
      </Button>
    </div>
  );
}

function GalleryEditor({ gallery, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  const addFiles = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setBusy(true);
    try {
      const uploaded = await Promise.all(files.map((file) => adminApi.upload(file)));
      onChange([...gallery, ...uploaded.map((item) => ({ path: item.path, alt: '' }))]);
      notify(`Загружено файлов: ${uploaded.length}`);
    } catch (uploadError) {
      notify(uploadError.message, 'error');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {gallery.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {gallery.map((image, index) => (
            <div key={image.path + index} className="group relative h-24 w-24 overflow-hidden rounded-sm border border-white/10">
              <img src={image.path} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                title="Убрать из галереи"
                onClick={() => onChange(gallery.filter((_, position) => position !== index))}
                className="absolute inset-0 hidden items-center justify-center bg-background/70 text-red-300 group-hover:flex"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <Button icon="add_photo_alternate" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? 'Загрузка…' : 'Добавить изображения'}
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/webp,image/jpeg,image/png,image/svg+xml"
        className="hidden"
        onChange={addFiles}
      />
    </div>
  );
}

function ApplicationsEditor({ applications, onChange }) {
  const update = (index, patch) =>
    onChange(applications.map((item, position) => (position === index ? { ...item, ...patch } : item)));

  return (
    <div className="space-y-3">
      {applications.map((application, index) => (
        <div key={index} className="space-y-2 rounded-sm border border-outline-variant/40 bg-surface/30 p-3">
          <div className="flex gap-2">
            <Input
              value={application.title}
              onChange={(event) => update(index, { title: event.target.value })}
              placeholder="Название области применения"
            />
            <IconButton
              icon="delete"
              title="Удалить"
              onClick={() => onChange(applications.filter((_, position) => position !== index))}
            />
          </div>
          <Textarea
            rows={2}
            value={application.description ?? ''}
            onChange={(event) => update(index, { description: event.target.value })}
            placeholder="Описание (необязательно)"
          />
        </div>
      ))}

      <Button icon="add" onClick={() => onChange([...applications, { title: '', description: '' }])}>
        Добавить применение
      </Button>
    </div>
  );
}

export default function ProductEdit({ id, user, navigate }) {
  const [form, setForm] = useState(id ? null : EMPTY);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const notify = useToast();

  const readOnly = user.role === 'viewer';

  useEffect(() => {
    adminApi.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) {
      setForm(EMPTY);
      return;
    }

    adminApi
      .product(id)
      .then((product) => setForm({ ...EMPTY, ...product, category_id: product.category_id ?? '' }))
      .catch((error) => notify(error.message, 'error'));
  }, [id]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  const save = async () => {
    if (!form.name.trim()) {
      notify('Укажите название товара', 'error');
      return;
    }

    setSaving(true);

    try {
      if (id) {
        await adminApi.updateProduct(id, form);
        notify('Сохранено');
        setForm({ ...form, ...(await adminApi.product(id)) });
      } else {
        const { id: newId } = await adminApi.createProduct(form);
        await adminApi.updateProduct(newId, form);
        notify('Товар создан');
        navigate(`/admin/products/${newId}`);
      }
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    const next = form.status === 'published' ? 'draft' : 'published';

    try {
      await adminApi.setProductStatus(id, next);
      set({ status: next });
      notify(next === 'published' ? 'Опубликован' : 'Снят с публикации');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const remove = async () => {
    setConfirmDelete(false);

    try {
      await adminApi.deleteProduct(id);
      notify('Товар удалён');
      navigate('/admin/products');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  if (!form) return <Spinner />;

  return (
    <>
      <PageHeader title={id ? form.name || 'Товар' : 'Новый товар'} description={id ? `/${form.slug}` : 'Создание карточки'}>
        <Button variant="ghost" icon="arrow_back" onClick={() => navigate('/admin/products')}>
          К списку
        </Button>

        {id && form.status === 'published' && (
          <Button icon="open_in_new" onClick={() => window.open(`/products/${form.slug}`, '_blank', 'noopener')}>
            На сайте
          </Button>
        )}

        {id && !readOnly && (
          <Button icon={form.status === 'published' ? 'visibility_off' : 'publish'} onClick={toggleStatus}>
            {form.status === 'published' ? 'Снять' : 'Опубликовать'}
          </Button>
        )}

        {!readOnly && (
          <Button variant="primary" icon="save" disabled={saving} onClick={save}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        )}
      </PageHeader>

      {id && (
        <div className="mb-6">
          <Badge tone={form.status === 'published' ? 'success' : 'neutral'}>
            {form.status === 'published' ? 'Опубликован' : 'Черновик'}
          </Badge>
        </div>
      )}

      <fieldset disabled={readOnly} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Основное">
            <div className="space-y-4">
              <Field label="Название" required>
                <Input value={form.name} onChange={(event) => set({ name: event.target.value })} placeholder="Носимая с экраном" />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Адрес страницы" hint="Оставьте пустым — сгенерируется из названия">
                  <Input value={form.slug} onChange={(event) => set({ slug: event.target.value })} placeholder="nosimaya-s-ekranom" />
                </Field>

                <Field label="Категория">
                  <Select value={form.category_id} onChange={(event) => set({ category_id: event.target.value })}>
                    <option value="">— без категории —</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Краткое описание" hint="Выводится на карточке в каталоге">
                <Textarea
                  rows={2}
                  value={form.short_description}
                  onChange={(event) => set({ short_description: event.target.value })}
                />
              </Field>

              <Field label="Полное описание" hint="Выводится на странице товара">
                <Textarea
                  rows={6}
                  value={form.full_description}
                  onChange={(event) => set({ full_description: event.target.value })}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Технические характеристики">
            <SpecsEditor specs={form.specs} onChange={(specs) => set({ specs })} />
          </Panel>

          <Panel title="Области применения">
            <ApplicationsEditor
              applications={form.applications}
              onChange={(applications) => set({ applications })}
            />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Изображения">
            <div className="space-y-5">
              <ImagePicker
                label="Главное изображение"
                value={form.main_image}
                onChange={(main_image) => set({ main_image })}
              />
              <div>
                <span className="mb-2 block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Галерея
                </span>
                <GalleryEditor gallery={form.gallery} onChange={(gallery) => set({ gallery })} />
              </div>
            </div>
          </Panel>

          <Panel title="Оформление">
            <Field label="Плашка на карточке" hint="Например SYSTEM ACTIVE. Пусто — плашки не будет">
              <Input value={form.badge} onChange={(event) => set({ badge: event.target.value })} />
            </Field>
          </Panel>

          {id && (
            <Panel title="Документация">
              {form.documents?.length ? (
                <ul className="space-y-2">
                  {form.documents.map((document) => (
                    <li key={document.id} className="flex items-center gap-2 font-body-md text-body-md">
                      <span className="material-symbols-outlined text-[18px] text-primary">picture_as_pdf</span>
                      <span className="min-w-0 flex-1 truncate text-on-surface">{document.title}</span>
                      <Badge tone={document.status === 'published' ? 'success' : 'neutral'}>
                        {document.status === 'published' ? 'Опубл.' : 'Черновик'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-body-md text-body-md text-on-surface-variant">Документов нет.</p>
              )}
              <a
                href="/admin/documents"
                className="mt-4 inline-flex items-center gap-1.5 font-label-sm text-[11px] uppercase tracking-widest text-primary hover:underline"
              >
                Управление документами
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </Panel>
          )}

          {id && !readOnly && (
            <Panel title="Опасная зона">
              <Button variant="danger" icon="delete" onClick={() => setConfirmDelete(true)}>
                Удалить товар
              </Button>
            </Panel>
          )}
        </div>
      </fieldset>

      <ConfirmDialog
        open={confirmDelete}
        title={`Удалить «${form.name}»?`}
        description="Характеристики, галерея и привязанные документы удалятся вместе с товаром."
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
