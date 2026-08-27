import { Router } from 'express';
import multer from 'multer';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync, statSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from '../../db/index.js';
import { requireRole } from '../../lib/auth.js';

const here = dirname(fileURLToPath(import.meta.url));

export const UPLOAD_DIR = process.env.KAE_UPLOAD_DIR || join(here, '..', '..', 'uploads');

export const mediaRouter = Router();

const editor = requireRole('editor');

const ALLOWED = {
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (ALLOWED[file.mimetype]) return callback(null, true);

    callback(new Error('Допустимы только WebP, JPG, PNG, SVG и PDF'));
  },
});

/**
 * Имя файла — хеш его содержимого. Один и тот же файл, загруженный дважды,
 * получает то же имя и физически не дублируется.
 */
function store(file) {
  mkdirSync(UPLOAD_DIR, { recursive: true });

  const hash = createHash('sha256').update(file.buffer).digest('hex').slice(0, 16);
  const extension = ALLOWED[file.mimetype] || extname(file.originalname).toLowerCase();
  const filename = `${hash}${extension}`;
  const fullPath = join(UPLOAD_DIR, filename);

  const reused = existsSync(fullPath);
  if (!reused) writeFileSync(fullPath, file.buffer);

  return { path: `/uploads/${filename}`, size: file.buffer.length, reused };
}

// ---------------------------------------------------------------------------
// Медиатека
// ---------------------------------------------------------------------------

mediaRouter.post('/upload', editor, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не передан' });

  res.status(201).json({ ...store(req.file), original_name: req.file.originalname });
});

mediaRouter.get('/', (req, res) => {
  if (!existsSync(UPLOAD_DIR)) return res.json([]);

  const files = readdirSync(UPLOAD_DIR)
    .filter((name) => !name.startsWith('.'))
    .map((name) => {
      const stats = statSync(join(UPLOAD_DIR, name));
      return { path: `/uploads/${name}`, size: stats.size, modified_at: stats.mtime.toISOString() };
    })
    .sort((a, b) => b.modified_at.localeCompare(a.modified_at));

  res.json(files);
});

mediaRouter.delete('/', editor, (req, res) => {
  const target = String(req.body?.path ?? '');

  // Только простые имена внутри каталога загрузок — защита от обхода пути.
  if (!/^\/uploads\/[A-Za-z0-9._-]+$/.test(target)) {
    return res.status(400).json({ error: 'Некорректный путь' });
  }

  const db = getDb();
  const usedBy =
    db.prepare('SELECT COUNT(*) AS count FROM products WHERE main_image = ?').get(target).count +
    db.prepare('SELECT COUNT(*) AS count FROM product_images WHERE path = ?').get(target).count +
    db.prepare('SELECT COUNT(*) AS count FROM documents WHERE file_path = ?').get(target).count +
    db.prepare('SELECT COUNT(*) AS count FROM team_members WHERE photo = ?').get(target).count;

  if (usedBy > 0) {
    return res.status(409).json({ error: `Файл используется в ${usedBy} записи(ях)` });
  }

  const fullPath = join(UPLOAD_DIR, target.replace('/uploads/', ''));
  if (existsSync(fullPath)) unlinkSync(fullPath);

  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Документация (PDF, привязанная к товару)
// ---------------------------------------------------------------------------

mediaRouter.get('/documents', (req, res) => {
  res.json(
    getDb()
      .prepare(`
        SELECT d.*, p.name AS product_name, p.slug AS product_slug
        FROM documents d LEFT JOIN products p ON p.id = d.product_id
        ORDER BY d.sort, d.id
      `)
      .all(),
  );
});

mediaRouter.post('/documents', editor, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не передан' });

  const title = String(req.body?.title ?? '').trim().slice(0, 300) || req.file.originalname;
  const stored = store(req.file);
  const db = getDb();

  const nextSort = db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS value FROM documents').get().value;

  const { lastInsertRowid } = db
    .prepare(`
      INSERT INTO documents (product_id, title, file_path, file_size, type, status, sort)
      VALUES (?, ?, ?, ?, ?, 'draft', ?)
    `)
    .run(
      req.body?.product_id ? Number(req.body.product_id) : null,
      title,
      stored.path,
      stored.size,
      String(req.body?.type ?? 'datasheet').slice(0, 60),
      nextSort,
    );

  res.status(201).json({ id: Number(lastInsertRowid), ...stored });
});

/** Замена файла у существующего документа. */
mediaRouter.put('/documents/:id/file', editor, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не передан' });

  const stored = store(req.file);
  const result = getDb()
    .prepare('UPDATE documents SET file_path = ?, file_size = ? WHERE id = ?')
    .run(stored.path, stored.size, Number(req.params.id));

  if (!result.changes) return res.status(404).json({ error: 'Документ не найден' });

  res.json({ ok: true, ...stored });
});

mediaRouter.patch('/documents/:id', editor, (req, res) => {
  const fields = [];
  const values = [];

  if (req.body?.title !== undefined) {
    fields.push('title = ?');
    values.push(String(req.body.title).trim().slice(0, 300));
  }

  if (req.body?.status !== undefined) {
    if (!['draft', 'published'].includes(req.body.status)) {
      return res.status(400).json({ error: 'Статус должен быть draft или published' });
    }
    fields.push('status = ?');
    values.push(req.body.status);
  }

  if (req.body?.product_id !== undefined) {
    fields.push('product_id = ?');
    values.push(req.body.product_id ? Number(req.body.product_id) : null);
  }

  if (!fields.length) return res.status(400).json({ error: 'Нечего обновлять' });

  const result = getDb()
    .prepare(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`)
    .run(...values, Number(req.params.id));

  if (!result.changes) return res.status(404).json({ error: 'Документ не найден' });

  res.json({ ok: true });
});

mediaRouter.delete('/documents/:id', editor, (req, res) => {
  // Сам файл остаётся в медиатеке — его могут использовать другие записи.
  const result = getDb().prepare('DELETE FROM documents WHERE id = ?').run(Number(req.params.id));

  if (!result.changes) return res.status(404).json({ error: 'Документ не найден' });

  res.json({ ok: true });
});
