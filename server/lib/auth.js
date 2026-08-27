/**
 * Авторизация админки. Публичная часть сайта аутентификации не требует —
 * эти middleware вешаются только на /api/admin/*.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from '../db/index.js';

const here = dirname(fileURLToPath(import.meta.url));

export const COOKIE_NAME = 'kae_session';
const TOKEN_TTL = '7d';

/** Иерархия ролей: право включает все права ниже по списку. */
const ROLE_LEVEL = { viewer: 1, editor: 2, admin: 3 };

/**
 * Секрет для подписи токенов. В production обязателен JWT_SECRET в окружении;
 * для локальной разработки генерируем один раз и держим в server/data,
 * иначе при каждом перезапуске все сессии слетают.
 */
function resolveSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET обязателен в production. Задайте его в окружении.');
  }

  const file = join(here, '..', 'data', '.jwt-secret');
  if (existsSync(file)) return readFileSync(file, 'utf8').trim();

  const secret = randomBytes(32).toString('hex');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, secret, { mode: 0o600 });
  return secret;
}

const SECRET = resolveSecret();

// ---------------------------------------------------------------------------
// Вход
// ---------------------------------------------------------------------------

/** Простой лимит попыток входа: 10 за 15 минут на email+IP. */
const attempts = new Map();
const ATTEMPT_LIMIT = 10;
const ATTEMPT_WINDOW = 15 * 60 * 1000;

export function tooManyAttempts(key) {
  const entry = attempts.get(key);
  if (!entry) return false;

  if (Date.now() - entry.first > ATTEMPT_WINDOW) {
    attempts.delete(key);
    return false;
  }

  return entry.count >= ATTEMPT_LIMIT;
}

export function registerFailure(key) {
  const entry = attempts.get(key);

  if (!entry || Date.now() - entry.first > ATTEMPT_WINDOW) {
    attempts.set(key, { count: 1, first: Date.now() });
    return;
  }

  entry.count += 1;
}

export function clearFailures(key) {
  attempts.delete(key);
}

/**
 * Проверяет пару email/пароль. Возвращает пользователя без хеша либо null.
 */
export function verifyCredentials(email, password) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase().trim());

  // bcrypt.compareSync и на несуществующем пользователе: сравниваем с фиктивным
  // хешем, чтобы время ответа не выдавало, заведён ли такой email.
  const hash = user?.password_hash || '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
  const ok = bcrypt.compareSync(String(password), hash);

  if (!user || !ok) return null;

  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function issueToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: TOKEN_TTL });
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Требует валидную сессию. Пользователь перечитывается из БД, чтобы смена роли
 * или удаление аккаунта действовали немедленно, не дожидаясь истечения токена.
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Требуется вход' });

  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch {
    return res.status(401).json({ error: 'Сессия истекла' });
  }

  const user = getDb()
    .prepare('SELECT id, email, name, role FROM users WHERE id = ?')
    .get(payload.sub);

  if (!user) return res.status(401).json({ error: 'Пользователь не найден' });

  req.user = user;
  next();
}

/**
 * Требует роль не ниже указанной: requireRole('editor') пропустит editor и admin.
 */
export function requireRole(minimum) {
  return (req, res, next) => {
    if (ROLE_LEVEL[req.user?.role] >= ROLE_LEVEL[minimum]) return next();

    res.status(403).json({ error: 'Недостаточно прав' });
  };
}

export { bcrypt };
