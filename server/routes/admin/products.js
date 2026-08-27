import { Router } from 'express';
import { getDb } from '../../db/index.js';
import { uniqueSlug } from '../../lib/slug.js';
import { requireRole } from '../../lib/auth.js';

export const productsRouter = Router();

const clean = (value, limit = 500) => String(value ?? '').trim().slice(0, limit);
const editor = requireRole('editor');

// ---------------------------------------------------------------------------
// Чтение (доступно и viewer)
// ---------------------------------------------------------------------------

productsRouter.get('/', (req, res) => {
  const products = getDb()
    .prepare(`
      SELECT p.id, p.slug, p.name, p.status, p.sort, p.main_image, p.short_description,
             c.name AS category, c.id AS category_id,
             (SELECT COUNT(*) FROM product_specs s WHERE s.product_id = p.id) AS specs_count,
             (SELECT COUNT(*) FROM documents d WHERE d.product_id = p.id) AS documents_count
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.sort, p.id
    `)
    .all();

  res.json(products);
});

productsRouter.get('/:id', (req, res) => {
  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(req.params.id));

  if (!product) return res.status(404).json({ error: 'Товар не найден' });

  res.json({
    ...product,
    specs: db
      .prepare('SELECT id, spec_group, name, value, is_key, sort FROM product_specs WHERE product_id = ? ORDER BY sort, id')
      .all(product.id),
    gallery: db
      .prepare('SELECT id, path, alt, sort FROM product_images WHERE product_id = ? ORDER BY sort, id')
      .all(product.id),
    applications: db
      .prepare('SELECT id, title, description, sort FROM product_applications WHERE product_id = ? ORDER BY sort, id')
      .all(product.id),
    documents: db
      .prepare('SELECT id, title, file_path, file_size, type, status, sort FROM documents WHERE product_id = ? ORDER BY sort, id')
      .all(product.id),
  });
});

// ---------------------------------------------------------------------------
// Запись (editor и выше)
// ---------------------------------------------------------------------------

productsRouter.post('/', editor, (req, res) => {
  const db = getDb();
  const name = clean(req.body?.name, 200);

  if (!name) return res.status(400).json({ error: 'Укажите название товара' });

  const nextSort =
    db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS value FROM products').get().value;

  const { lastInsertRowid } = db
    .prepare(`
      INSERT INTO products (name, slug, category_id, short_description, full_description, main_image, badge, status, sort)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?)
    `)
    .run(
      name,
      uniqueSlug(db, 'products', req.body?.slug || name),
      req.body?.category_id ? Number(req.body.category_id) : null,
      clean(req.body?.short_description, 1000),
      clean(req.body?.full_description, 20000),
      clean(req.body?.main_image, 1000),
      clean(req.body?.badge, 60),
      nextSort,
    );

  res.status(201).json({ id: Number(lastInsertRowid) });
});

productsRouter.put('/:id', editor, (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(id);

  if (!product) return res.status(404).json({ error: 'Товар не найден' });

  const name = clean(req.body?.name, 200);
  if (!name) return res.status(400).json({ error: 'Укажите название товара' });

  // Характеристики, галерея и применения приходят целыми списками и заменяются
  // одной транзакцией — так админка не должна отслеживать удалённые строки.
  db.exec('BEGIN');
  try {
    db.prepare(`
      UPDATE products SET
        name = ?, slug = ?, category_id = ?, short_description = ?, full_description = ?,
        main_image = ?, badge = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name,
      uniqueSlug(db, 'products', req.body?.slug || name, id),
      req.body?.category_id ? Number(req.body.category_id) : null,
      clean(req.body?.short_description, 1000),
      clean(req.body?.full_description, 20000),
      clean(req.body?.main_image, 1000),
      clean(req.body?.badge, 60),
      id,
    );

    if (Array.isArray(req.body?.specs)) {
      db.prepare('DELETE FROM product_specs WHERE product_id = ?').run(id);
      const insert = db.prepare(
        'INSERT INTO product_specs (product_id, spec_group, name, value, is_key, sort) VALUES (?, ?, ?, ?, ?, ?)',
      );

      req.body.specs
        .filter((spec) => clean(spec?.name, 200))
        .forEach((spec, index) => {
          insert.run(
            id,
            clean(spec.spec_group, 120),
            clean(spec.name, 200),
            clean(spec.value, 500),
            spec.is_key ? 1 : 0,
            index,
          );
        });
    }

    if (Array.isArray(req.body?.gallery)) {
      db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
      const insert = db.prepare('INSERT INTO product_images (product_id, path, alt, sort) VALUES (?, ?, ?, ?)');

      req.body.gallery
        .filter((image) => clean(image?.path, 1000))
        .forEach((image, index) => insert.run(id, clean(image.path, 1000), clean(image.alt, 300), index));
    }

    if (Array.isArray(req.body?.applications)) {
      db.prepare('DELETE FROM product_applications WHERE product_id = ?').run(id);
      const insert = db.prepare(
        'INSERT INTO product_applications (product_id, title, description, sort) VALUES (?, ?, ?, ?)',
      );

      req.body.applications
        .filter((item) => clean(item?.title, 200))
        .forEach((item, index) => insert.run(id, clean(item.title, 200), clean(item.description, 1000), index));
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  res.json({ ok: true });
});

/** Публикация и снятие с публикации. */
productsRouter.patch('/:id/status', editor, (req, res) => {
  const status = clean(req.body?.status, 20);

  if (!['draft', 'published'].includes(status)) {
    return res.status(400).json({ error: 'Статус должен быть draft или published' });
  }

  const result = getDb()
    .prepare("UPDATE products SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, Number(req.params.id));

  if (!result.changes) return res.status(404).json({ error: 'Товар не найден' });

  res.json({ ok: true, status });
});

/** Массовая пересортировка: [{ id, sort }]. */
productsRouter.post('/reorder', editor, (req, res) => {
  if (!Array.isArray(req.body?.order)) {
    return res.status(400).json({ error: 'Ожидается массив order' });
  }

  const db = getDb();
  const update = db.prepare('UPDATE products SET sort = ? WHERE id = ?');

  db.exec('BEGIN');
  try {
    req.body.order.forEach((item, index) => update.run(Number(item?.sort ?? index), Number(item?.id)));
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  res.json({ ok: true });
});

productsRouter.delete('/:id', editor, (req, res) => {
  // Характеристики, галерея, применения и документы уйдут по ON DELETE CASCADE.
  const result = getDb().prepare('DELETE FROM products WHERE id = ?').run(Number(req.params.id));

  if (!result.changes) return res.status(404).json({ error: 'Товар не найден' });

  res.json({ ok: true });
});
