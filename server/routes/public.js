/**
 * Публичный API сайта. Аутентификация не требуется — это данные,
 * которые и так видит любой посетитель.
 */
import { Router } from 'express';
import { getDb } from '../db/index.js';
import { rateLimit } from '../lib/rate-limit.js';

export const publicRouter = Router();

const MAX_FIELD = 2000;

// Форма обратной связи пишет в базу без аутентификации: без лимита её
// заливает мусором любой скрипт в цикле. Пять заявок в час — заметно
// больше, чем нужно живому человеку.
const requestLimit = rateLimit({
  limit: 5,
  windowMs: 60 * 60 * 1000,
  message: 'Слишком много заявок с этого адреса. Попробуйте через некоторое время или позвоните нам.',
});

// Аналитика уходит на каждый переход по сайту, поэтому порог здесь высокий:
// он защищает от накрутки счётчиков, а не от обычного посетителя.
const trackLimit = rateLimit({
  limit: 120,
  windowMs: 60 * 1000,
  message: 'Слишком много событий',
});

/** Обрезает и чистит пользовательский ввод. */
const clean = (value, limit = 200) => String(value ?? '').trim().slice(0, limit);

// ---------------------------------------------------------------------------
// Каталог
// ---------------------------------------------------------------------------

publicRouter.get('/products', (req, res) => {
  const products = getDb()
    .prepare(`
      SELECT p.id, p.slug, p.name, p.short_description, p.main_image, p.badge,
             c.name AS category, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.status = 'published'
      ORDER BY p.sort, p.id
    `)
    .all();

  res.json(products);
});

publicRouter.get('/products/:slug', (req, res) => {
  const db = getDb();

  const product = db
    .prepare(`
      SELECT p.id, p.slug, p.name, p.short_description, p.full_description,
             p.main_image, p.badge,
             c.name AS category, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug = ? AND p.status = 'published'
    `)
    .get(req.params.slug);

  if (!product) return res.status(404).json({ error: 'Товар не найден' });

  const specs = db
    .prepare('SELECT spec_group, name, value, is_key FROM product_specs WHERE product_id = ? ORDER BY sort, id')
    .all(product.id);

  // Ключевые ТТХ выводятся отдельным блоком на странице товара,
  // остальные — таблицей, сгруппированной по spec_group.
  const groups = [];
  for (const spec of specs.filter((item) => !item.is_key)) {
    const title = spec.spec_group || '';
    let group = groups.find((item) => item.title === title);

    if (!group) {
      group = { title, items: [] };
      groups.push(group);
    }

    group.items.push({ name: spec.name, value: spec.value });
  }

  res.json({
    ...product,
    key_specs: specs.filter((item) => item.is_key).map(({ name, value }) => ({ name, value })),
    spec_groups: groups,
    gallery: db
      .prepare('SELECT path, alt FROM product_images WHERE product_id = ? ORDER BY sort, id')
      .all(product.id),
    applications: db
      .prepare('SELECT title, description FROM product_applications WHERE product_id = ? ORDER BY sort, id')
      .all(product.id),
    documents: db
      .prepare(`
        SELECT title, file_path, file_size, type
        FROM documents
        WHERE product_id = ? AND status = 'published'
        ORDER BY sort, id
      `)
      .all(product.id),
  });
});

// ---------------------------------------------------------------------------
// Тексты и команда
// ---------------------------------------------------------------------------

publicRouter.get('/texts', (req, res) => {
  const rows = getDb().prepare('SELECT key, value FROM texts').all();

  res.json(Object.fromEntries(rows.map((row) => [row.key, row.value])));
});

publicRouter.get('/team', (req, res) => {
  const members = getDb()
    .prepare('SELECT name, position, photo, tags FROM team_members ORDER BY sort, id')
    .all();

  res.json(members.map((member) => ({ ...member, tags: member.tags ? member.tags.split(',') : [] })));
});

// ---------------------------------------------------------------------------
// Заявки
// ---------------------------------------------------------------------------

publicRouter.post('/requests', requestLimit, (req, res) => {
  const name = clean(req.body?.name, 120);
  const email = clean(req.body?.email, 160);
  const phone = clean(req.body?.phone, 60);
  const subject = clean(req.body?.subject, 200);
  const message = clean(req.body?.message, MAX_FIELD);

  if (!name) return res.status(400).json({ error: 'Укажите имя' });
  if (!email && !phone) return res.status(400).json({ error: 'Укажите email или телефон' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Некорректный email' });
  }

  const db = getDb();

  // Заявка может прийти со страницы товара — привязываем, если slug известен.
  const productId = req.body?.product_slug
    ? db.prepare('SELECT id FROM products WHERE slug = ?').get(clean(req.body.product_slug, 200))?.id ?? null
    : null;

  const { lastInsertRowid } = db
    .prepare('INSERT INTO requests (name, email, phone, subject, message, product_id) VALUES (?, ?, ?, ?, ?, ?)')
    .run(name, email, phone, subject, message, productId);

  db.prepare("INSERT INTO analytics_events (type, path, product_id) VALUES ('request', ?, ?)").run(
    clean(req.body?.path, 200),
    productId,
  );

  res.status(201).json({ ok: true, id: Number(lastInsertRowid) });
});

// ---------------------------------------------------------------------------
// Аналитика
// ---------------------------------------------------------------------------

publicRouter.post('/track', trackLimit, (req, res) => {
  const type = clean(req.body?.type, 20);

  if (!['visit', 'product_view'].includes(type)) {
    return res.status(400).json({ error: 'Неизвестный тип события' });
  }

  const db = getDb();
  const productId = req.body?.product_slug
    ? db.prepare('SELECT id FROM products WHERE slug = ?').get(clean(req.body.product_slug, 200))?.id ?? null
    : null;

  db.prepare('INSERT INTO analytics_events (type, path, product_id, referrer) VALUES (?, ?, ?, ?)').run(
    type,
    clean(req.body?.path, 200),
    productId,
    clean(req.body?.referrer, 200),
  );

  res.status(204).end();
});
