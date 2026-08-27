import { Router } from 'express';
import { getDb } from '../../db/index.js';
import { uniqueSlug } from '../../lib/slug.js';
import { requireRole } from '../../lib/auth.js';

export const contentRouter = Router();

const clean = (value, limit = 500) => String(value ?? '').trim().slice(0, limit);
const editor = requireRole('editor');

// ---------------------------------------------------------------------------
// Категории
// ---------------------------------------------------------------------------

contentRouter.get('/categories', (req, res) => {
  const categories = getDb()
    .prepare(`
      SELECT c.id, c.name, c.slug, c.description, c.sort,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS products_count
      FROM categories c
      ORDER BY c.sort, c.id
    `)
    .all();

  res.json(categories);
});

contentRouter.post('/categories', editor, (req, res) => {
  const db = getDb();
  const name = clean(req.body?.name, 200);

  if (!name) return res.status(400).json({ error: 'Укажите название категории' });

  const nextSort = db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS value FROM categories').get().value;

  const { lastInsertRowid } = db
    .prepare('INSERT INTO categories (name, slug, description, sort) VALUES (?, ?, ?, ?)')
    .run(name, uniqueSlug(db, 'categories', req.body?.slug || name), clean(req.body?.description, 1000), nextSort);

  res.status(201).json({ id: Number(lastInsertRowid) });
});

contentRouter.put('/categories/:id', editor, (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const name = clean(req.body?.name, 200);

  if (!name) return res.status(400).json({ error: 'Укажите название категории' });

  const result = db
    .prepare("UPDATE categories SET name = ?, slug = ?, description = ?, updated_at = datetime('now') WHERE id = ?")
    .run(name, uniqueSlug(db, 'categories', req.body?.slug || name, id), clean(req.body?.description, 1000), id);

  if (!result.changes) return res.status(404).json({ error: 'Категория не найдена' });

  res.json({ ok: true });
});

contentRouter.delete('/categories/:id', editor, (req, res) => {
  // У товаров category_id обнулится (ON DELETE SET NULL), сами товары останутся.
  const result = getDb().prepare('DELETE FROM categories WHERE id = ?').run(Number(req.params.id));

  if (!result.changes) return res.status(404).json({ error: 'Категория не найдена' });

  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Тексты сайта
// ---------------------------------------------------------------------------

contentRouter.get('/texts', (req, res) => {
  const texts = getDb()
    .prepare('SELECT key, label, value, type, group_name, sort FROM texts ORDER BY group_name, sort, key')
    .all();

  res.json(texts);
});

/** Сохранение пачкой: { values: { "contacts.phone": "…" } }. */
contentRouter.put('/texts', editor, (req, res) => {
  const values = req.body?.values;

  if (!values || typeof values !== 'object') {
    return res.status(400).json({ error: 'Ожидается объект values' });
  }

  const db = getDb();
  const update = db.prepare("UPDATE texts SET value = ?, updated_at = datetime('now') WHERE key = ?");

  db.exec('BEGIN');
  try {
    for (const [key, value] of Object.entries(values)) {
      update.run(clean(value, 20000), clean(key, 120));
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  res.json({ ok: true, updated: Object.keys(values).length });
});

// ---------------------------------------------------------------------------
// Команда
// ---------------------------------------------------------------------------

contentRouter.get('/team', (req, res) => {
  res.json(getDb().prepare('SELECT id, name, position, photo, tags, sort FROM team_members ORDER BY sort, id').all());
});

contentRouter.post('/team', editor, (req, res) => {
  const db = getDb();
  const name = clean(req.body?.name, 200);

  if (!name) return res.status(400).json({ error: 'Укажите имя' });

  const nextSort = db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS value FROM team_members').get().value;

  const { lastInsertRowid } = db
    .prepare('INSERT INTO team_members (name, position, photo, tags, sort) VALUES (?, ?, ?, ?, ?)')
    .run(name, clean(req.body?.position, 200), clean(req.body?.photo, 1000), clean(req.body?.tags, 200), nextSort);

  res.status(201).json({ id: Number(lastInsertRowid) });
});

contentRouter.put('/team/:id', editor, (req, res) => {
  const name = clean(req.body?.name, 200);

  if (!name) return res.status(400).json({ error: 'Укажите имя' });

  const result = getDb()
    .prepare('UPDATE team_members SET name = ?, position = ?, photo = ?, tags = ? WHERE id = ?')
    .run(
      name,
      clean(req.body?.position, 200),
      clean(req.body?.photo, 1000),
      clean(req.body?.tags, 200),
      Number(req.params.id),
    );

  if (!result.changes) return res.status(404).json({ error: 'Сотрудник не найден' });

  res.json({ ok: true });
});

contentRouter.delete('/team/:id', editor, (req, res) => {
  const result = getDb().prepare('DELETE FROM team_members WHERE id = ?').run(Number(req.params.id));

  if (!result.changes) return res.status(404).json({ error: 'Сотрудник не найден' });

  res.json({ ok: true });
});
