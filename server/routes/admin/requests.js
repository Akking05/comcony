import { Router } from 'express';
import { getDb } from '../../db/index.js';
import { requireRole } from '../../lib/auth.js';

export const requestsRouter = Router();

const STATUSES = ['new', 'in_progress', 'done', 'spam'];
const editor = requireRole('editor');

/** Список заявок с фильтром по статусу: ?status=new */
requestsRouter.get('/', (req, res) => {
  const status = String(req.query.status ?? '').trim();
  const db = getDb();

  const rows = STATUSES.includes(status)
    ? db
        .prepare(`
          SELECT r.*, p.name AS product_name, p.slug AS product_slug
          FROM requests r LEFT JOIN products p ON p.id = r.product_id
          WHERE r.status = ? ORDER BY r.created_at DESC, r.id DESC
        `)
        .all(status)
    : db
        .prepare(`
          SELECT r.*, p.name AS product_name, p.slug AS product_slug
          FROM requests r LEFT JOIN products p ON p.id = r.product_id
          ORDER BY r.created_at DESC, r.id DESC
        `)
        .all();

  const counts = Object.fromEntries(
    db.prepare('SELECT status, COUNT(*) AS count FROM requests GROUP BY status').all()
      .map((row) => [row.status, row.count]),
  );

  res.json({ requests: rows, counts });
});

requestsRouter.patch('/:id', editor, (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const fields = [];
  const values = [];

  if (req.body?.status !== undefined) {
    if (!STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: `Статус должен быть одним из: ${STATUSES.join(', ')}` });
    }
    fields.push('status = ?');
    values.push(req.body.status);
  }

  if (req.body?.note !== undefined) {
    fields.push('note = ?');
    values.push(String(req.body.note).trim().slice(0, 5000));
  }

  if (!fields.length) return res.status(400).json({ error: 'Нечего обновлять' });

  const result = db.prepare(`UPDATE requests SET ${fields.join(', ')} WHERE id = ?`).run(...values, id);

  if (!result.changes) return res.status(404).json({ error: 'Заявка не найдена' });

  res.json({ ok: true });
});

requestsRouter.delete('/:id', editor, (req, res) => {
  const result = getDb().prepare('DELETE FROM requests WHERE id = ?').run(Number(req.params.id));

  if (!result.changes) return res.status(404).json({ error: 'Заявка не найдена' });

  res.json({ ok: true });
});
