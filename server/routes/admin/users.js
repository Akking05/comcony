import { Router } from 'express';
import { getDb } from '../../db/index.js';
import { bcrypt, requireRole } from '../../lib/auth.js';

export const usersRouter = Router();

const ROLES = ['admin', 'editor', 'viewer'];
const MIN_PASSWORD = 10;

// Пользователями управляет только admin — editor до этого раздела не допускается.
usersRouter.use(requireRole('admin'));

usersRouter.get('/', (req, res) => {
  res.json(
    getDb()
      .prepare('SELECT id, email, name, role, created_at, last_login_at FROM users ORDER BY id')
      .all(),
  );
});

usersRouter.post('/', (req, res) => {
  const email = String(req.body?.email ?? '').toLowerCase().trim();
  const password = String(req.body?.password ?? '');
  const name = String(req.body?.name ?? '').trim().slice(0, 200);
  const role = String(req.body?.role ?? 'viewer');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Некорректный email' });
  }
  if (password.length < MIN_PASSWORD) {
    return res.status(400).json({ error: `Пароль не короче ${MIN_PASSWORD} символов` });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ error: `Роль должна быть одной из: ${ROLES.join(', ')}` });
  }
  if (getDb().prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'Пользователь с таким email уже есть' });
  }

  const { lastInsertRowid } = getDb()
    .prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)')
    .run(email, bcrypt.hashSync(password, 12), name || email, role);

  res.status(201).json({ id: Number(lastInsertRowid) });
});

usersRouter.put('/:id', (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(id);

  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  const fields = [];
  const values = [];

  if (req.body?.name !== undefined) {
    fields.push('name = ?');
    values.push(String(req.body.name).trim().slice(0, 200));
  }

  if (req.body?.role !== undefined) {
    if (!ROLES.includes(req.body.role)) {
      return res.status(400).json({ error: `Роль должна быть одной из: ${ROLES.join(', ')}` });
    }

    // Не даём снять последнего администратора — иначе в админку никто не войдёт.
    const admins = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").get().count;
    if (user.role === 'admin' && req.body.role !== 'admin' && admins <= 1) {
      return res.status(400).json({ error: 'Нельзя снять роль с последнего администратора' });
    }

    fields.push('role = ?');
    values.push(req.body.role);
  }

  if (req.body?.password) {
    if (String(req.body.password).length < MIN_PASSWORD) {
      return res.status(400).json({ error: `Пароль не короче ${MIN_PASSWORD} символов` });
    }
    fields.push('password_hash = ?');
    values.push(bcrypt.hashSync(String(req.body.password), 12));
  }

  if (!fields.length) return res.status(400).json({ error: 'Нечего обновлять' });

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values, id);

  res.json({ ok: true });
});

usersRouter.delete('/:id', (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);

  if (id === req.user.id) {
    return res.status(400).json({ error: 'Нельзя удалить собственную учётную запись' });
  }

  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  const admins = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").get().count;
  if (user.role === 'admin' && admins <= 1) {
    return res.status(400).json({ error: 'Нельзя удалить последнего администратора' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);

  res.json({ ok: true });
});
