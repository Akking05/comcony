import express from 'express';
import cookieParser from 'cookie-parser';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './db/index.js';
import { publicRouter } from './routes/public.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin/index.js';
import { UPLOAD_DIR } from './routes/admin/media.js';

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const DIST_DIR = join(here, '..', 'dist');

const app = express();

// За nginx — доверяем X-Forwarded-*, иначе req.ip будет адресом прокси
// и лимит попыток входа станет общим для всех.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// --- API --------------------------------------------------------------------
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api', publicRouter);

// --- Загруженные файлы ------------------------------------------------------
// В production их отдаёт nginx напрямую; здесь — для локальной разработки
// и как запасной вариант.
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, { maxAge: '30d', index: false, fallthrough: true }),
);

// --- Статика собранного фронтенда ------------------------------------------
// Работает после `npm run build`. В разработке фронтенд отдаёт Vite на :5173,
// а сюда ходит только за /api.
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false }));

  // SPA: все не-API маршруты отдают index.html, включая /admin и /products/:slug.
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(join(DIST_DIR, 'index.html'));
  });
}

// --- Обработка ошибок -------------------------------------------------------
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  // Ошибки multer (размер, тип файла) — это ошибки клиента, не сервера.
  const isUploadError = error?.code?.startsWith?.('LIMIT_') || /WebP|PDF/.test(error?.message ?? '');

  if (isUploadError) {
    return res.status(400).json({ error: error.message });
  }

  console.error(error);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Прогреваем подключение и применяем схему до первого запроса.
getDb();

app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}/api`);
  if (existsSync(DIST_DIR)) console.log(`Сайт: http://localhost:${PORT}`);
});
