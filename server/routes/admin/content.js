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
      SELECT c.id, c.name, c.name_en, c.slug, c.description, c.description_en, c.sort,
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
    .prepare(
      'INSERT INTO categories (name, name_en, slug, description, description_en, sort) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(
      name,
      clean(req.body?.name_en, 200),
      uniqueSlug(db, 'categories', req.body?.slug || name),
      clean(req.body?.description, 1000),
      clean(req.body?.description_en, 1000),
      nextSort,
    );

  res.status(201).json({ id: Number(lastInsertRowid) });
});

contentRouter.put('/categories/:id', editor, (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const name = clean(req.body?.name, 200);

  if (!name) return res.status(400).json({ error: 'Укажите название категории' });

  const result = db
    .prepare(`
      UPDATE categories SET
        name = ?, name_en = ?, slug = ?, description = ?, description_en = ?, updated_at = datetime('now')
      WHERE id = ?
    `)
    .run(
      name,
      clean(req.body?.name_en, 200),
      uniqueSlug(db, 'categories', req.body?.slug || name, id),
      clean(req.body?.description, 1000),
      clean(req.body?.description_en, 1000),
      id,
    );

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
    .prepare('SELECT key, label, value, value_en, type, group_name, sort FROM texts ORDER BY group_name, sort, key')
    .all();

  res.json(texts);
});

/**
 * Сохранение пачкой. Русские значения приходят в values, английские —
 * в values_en; можно прислать только одно из полей:
 *
 *   { values: { "contacts.phone": "…" }, values_en: { "about.title": "…" } }
 */
contentRouter.put('/texts', editor, (req, res) => {
  const values = req.body?.values;
  const valuesEn = req.body?.values_en;

  const isObject = (candidate) => Boolean(candidate) && typeof candidate === 'object';

  if (!isObject(values) && !isObject(valuesEn)) {
    return res.status(400).json({ error: 'Ожидается объект values или values_en' });
  }

  const db = getDb();
  const columns = {
    value: db.prepare("UPDATE texts SET value = ?, updated_at = datetime('now') WHERE key = ?"),
    value_en: db.prepare("UPDATE texts SET value_en = ?, updated_at = datetime('now') WHERE key = ?"),
  };

  let updated = 0;

  db.exec('BEGIN');
  try {
    for (const [column, source] of [
      ['value', values],
      ['value_en', valuesEn],
    ]) {
      if (!isObject(source)) continue;

      for (const [key, value] of Object.entries(source)) {
        columns[column].run(clean(value, 20000), clean(key, 120));
        updated += 1;
      }
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  res.json({ ok: true, updated });
});

// ---------------------------------------------------------------------------
// Команда
// ---------------------------------------------------------------------------

contentRouter.get('/team', (req, res) => {
  res.json(
    getDb()
      .prepare('SELECT id, name, name_en, position, position_en, photo, tags, sort FROM team_members ORDER BY sort, id')
      .all(),
  );
});

contentRouter.post('/team', editor, (req, res) => {
  const db = getDb();
  const name = clean(req.body?.name, 200);

  if (!name) return res.status(400).json({ error: 'Укажите имя' });

  const nextSort = db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS value FROM team_members').get().value;

  const { lastInsertRowid } = db
    .prepare(
      'INSERT INTO team_members (name, name_en, position, position_en, photo, tags, sort) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      name,
      clean(req.body?.name_en, 200),
      clean(req.body?.position, 200),
      clean(req.body?.position_en, 200),
      clean(req.body?.photo, 1000),
      clean(req.body?.tags, 200),
      nextSort,
    );

  res.status(201).json({ id: Number(lastInsertRowid) });
});

contentRouter.put('/team/:id', editor, (req, res) => {
  const name = clean(req.body?.name, 200);

  if (!name) return res.status(400).json({ error: 'Укажите имя' });

  const result = getDb()
    .prepare('UPDATE team_members SET name = ?, name_en = ?, position = ?, position_en = ?, photo = ?, tags = ? WHERE id = ?')
    .run(
      name,
      clean(req.body?.name_en, 200),
      clean(req.body?.position, 200),
      clean(req.body?.position_en, 200),
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
