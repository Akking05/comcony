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

// --- robots.txt и sitemap.xml ----------------------------------------------
// Отдаются динамически и стоят до express.static, поэтому перекрывают
// одноимённые файлы из public/. Те нужны только витринному хостингу,
// где бэкенда нет и список товаров взять неоткуда.

/** Статические страницы сайта — те же, что в routes из src/PublicSite.jsx. */
const SITE_PAGES = ['/', '/products', '/about', '/contacts'];

// Домен берём из запроса, чтобы не зашивать его в код: за nginx с
// `trust proxy` req.protocol и Host уже соответствуют внешнему адресу.
// SITE_URL нужен, только если сайт доступен по нескольким именам.
const siteOrigin = (req) =>
  (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', '', `Sitemap: ${siteOrigin(req)}/sitemap.xml`, ''].join('\n'),
  );
});

app.get('/sitemap.xml', (req, res) => {
  const origin = siteOrigin(req);
  const slugs = getDb()
    .prepare("SELECT slug FROM products WHERE status = 'published' ORDER BY sort, id")
    .all();

  const paths = [...SITE_PAGES, ...slugs.map((row) => `/products/${row.slug}`)];

  res.type('application/xml').send(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...paths.map((path) => `  <url><loc>${origin}${encodeURI(path)}</loc></url>`),
      '</urlset>',
      '',
    ].join('\n'),
  );
});

// --- Статика собранного фронтенда ------------------------------------------
// Работает после `npm run build`. В разработке фронтенд отдаёт Vite на :5173,
// а сюда ходит только за /api.

/**
 * Существует ли такая страница. Нужно только для кода ответа: тело в любом
 * случае одно и то же — index.html, дальше разбирается роутер в браузере.
 */
function isKnownPage(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';

  if (SITE_PAGES.includes(clean)) return true;
  if (clean === '/admin' || clean.startsWith('/admin/')) return true;

  const product = clean.match(/^\/products\/([^/]+)$/);
  if (!product) return false;

  let slug = product[1];
  try {
    slug = decodeURIComponent(slug);
  } catch {
    return false;
  }

  return Boolean(
    getDb().prepare("SELECT 1 FROM products WHERE slug = ? AND status = 'published'").get(slug),
  );
}

if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false }));

  // SPA: все не-API маршруты отдают index.html, включая /admin и /products/:slug.
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    // Несуществующий адрес отдаёт ту же страницу, но с кодом 404. Иначе
    // поисковик считает /любую-опечатку полноценной страницей и индексирует
    // её как копию главной.
    res.status(isKnownPage(req.path) ? 200 : 404).sendFile(join(DIST_DIR, 'index.html'));
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
