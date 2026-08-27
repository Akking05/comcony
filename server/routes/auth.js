import { Router } from 'express';
import {
  COOKIE_NAME,
  clearFailures,
  cookieOptions,
  issueToken,
  registerFailure,
  requireAuth,
  tooManyAttempts,
  verifyCredentials,
} from '../lib/auth.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const email = String(req.body?.email ?? '').toLowerCase().trim();
  const password = String(req.body?.password ?? '');
  const key = `${email}|${req.ip}`;

  if (!email || !password) {
    return res.status(400).json({ error: 'Введите email и пароль' });
  }

  if (tooManyAttempts(key)) {
    return res.status(429).json({ error: 'Слишком много попыток. Повторите через 15 минут.' });
  }

  const user = verifyCredentials(email, password);

  if (!user) {
    registerFailure(key);
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }

  clearFailures(key);
  res.cookie(COOKIE_NAME, issueToken(user), cookieOptions());
  res.json(user);
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});
