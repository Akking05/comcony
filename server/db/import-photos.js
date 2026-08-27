/**
 * Перенос реальных фотографий продукции в медиатеку.
 *
 * Исходные снимки лежат папками с кириллическими именами и пробелами
 * («Носимая с экраном/My project-1 (13).webp») — такие адреса в URL
 * превращаются в percent-encoding и легко ломаются. Скрипт раскладывает их
 * в /uploads под ASCII-именами и заводит по одному черновику товара на папку.
 *
 *   node server/db/import-photos.js [путь-к-папке]
 *
 * Повторный запуск ничего не дублирует: файлы сверяются по содержимому,
 * товары — по slug.
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, closeDb } from './index.js';

const here = dirname(fileURLToPath(import.meta.url));

const SOURCE = process.argv[2] || join(here, '..', '..', '_source-photos');
const UPLOAD_DIR = process.env.KAE_UPLOAD_DIR || join(here, '..', 'uploads');

/** Соответствие исходных папок товарам и категориям. */
const MAPPING = {
  'Мобильная': {
    slug: 'mobile-station',
    product: 'Мобильная радиостанция',
    category: { name: 'Мобильные радиостанции', slug: 'mobile-stations' },
  },
  'Мобильный ретранслятор': {
    slug: 'mobile-repeater',
    product: 'Мобильный ретранслятор',
    category: { name: 'Ретрансляторы', slug: 'repeaters' },
  },
  'Носимая без экрана': {
    slug: 'portable-no-display',
    product: 'Носимая радиостанция без экрана',
    category: { name: 'Носимые радиостанции', slug: 'portable-stations' },
  },
  'Носимая с экраном': {
    slug: 'portable-display',
    product: 'Носимая радиостанция с экраном',
    category: { name: 'Носимые радиостанции', slug: 'portable-stations' },
  },
  'Стационарная': {
    slug: 'base-station',
    product: 'Стационарная радиостанция',
    category: { name: 'Стационарные радиостанции', slug: 'base-stations' },
  },
  'Стационарный ретранслятор': {
    slug: 'base-repeater',
    product: 'Стационарный ретранслятор',
    category: { name: 'Ретрансляторы', slug: 'repeaters' },
  },
};

if (!existsSync(SOURCE)) {
  console.error(`Папка с исходниками не найдена: ${SOURCE}`);
  process.exit(1);
}

const db = getDb();
mkdirSync(UPLOAD_DIR, { recursive: true });

// Содержимое уже лежащих в медиатеке файлов — чтобы не копировать повторно.
const knownHashes = new Map();
for (const name of existsSync(UPLOAD_DIR) ? readdirSync(UPLOAD_DIR) : []) {
  const file = join(UPLOAD_DIR, name);
  if (!statSync(file).isFile()) continue;

  knownHashes.set(createHash('sha256').update(readFileSync(file)).digest('hex'), `/uploads/${name}`);
}

const findCategory = db.prepare('SELECT id FROM categories WHERE slug = ?');
const insertCategory = db.prepare('INSERT INTO categories (name, slug, sort) VALUES (?, ?, ?) RETURNING id');
const findProduct = db.prepare('SELECT id FROM products WHERE slug = ?');
const insertProduct = db.prepare(`
  INSERT INTO products (name, slug, category_id, short_description, main_image, status, sort)
  VALUES (?, ?, ?, '', ?, 'draft', ?)
  RETURNING id
`);
const insertImage = db.prepare('INSERT INTO product_images (product_id, path, alt, sort) VALUES (?, ?, ?, ?)');

let copied = 0;
let reused = 0;
const summary = [];

for (const folder of readdirSync(SOURCE)) {
  const folderPath = join(SOURCE, folder);
  if (!statSync(folderPath).isDirectory()) continue;

  const mapping = MAPPING[folder];
  if (!mapping) {
    console.warn(`Пропущена незнакомая папка: ${folder}`);
    continue;
  }

  // Крупные файлы обычно и есть основные снимки — берём их первыми,
  // чтобы главным изображением стал самый качественный кадр.
  const photos = readdirSync(folderPath)
    .filter((name) => /\.webp$/i.test(name))
    .map((name) => ({ name, size: statSync(join(folderPath, name)).size }))
    .sort((a, b) => b.size - a.size);

  const paths = [];
  const seenInFolder = new Set();

  photos.forEach((photo) => {
    const buffer = readFileSync(join(folderPath, photo.name));
    const hash = createHash('sha256').update(buffer).digest('hex');

    // Один и тот же кадр встречается в нескольких папках — храним один файл.
    if (seenInFolder.has(hash)) return;
    seenInFolder.add(hash);

    if (knownHashes.has(hash)) {
      paths.push(knownHashes.get(hash));
      reused += 1;
      return;
    }

    const filename = `${mapping.slug}-${String(paths.length + 1).padStart(2, '0')}.webp`;
    copyFileSync(join(folderPath, photo.name), join(UPLOAD_DIR, filename));

    const publicPath = `/uploads/${filename}`;
    knownHashes.set(hash, publicPath);
    paths.push(publicPath);
    copied += 1;
  });

  if (!paths.length) continue;

  const categoryId =
    findCategory.get(mapping.category.slug)?.id ??
    insertCategory.get(
      mapping.category.name,
      mapping.category.slug,
      db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS value FROM categories').get().value,
    ).id;

  const existing = findProduct.get(mapping.slug);

  if (existing) {
    summary.push({ Товар: mapping.product, Фото: paths.length, Статус: 'уже был' });
    continue;
  }

  const nextSort = db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS value FROM products').get().value;
  const { id } = insertProduct.get(mapping.product, mapping.slug, categoryId, paths[0], nextSort);

  paths.slice(1).forEach((path, index) => insertImage.run(id, path, mapping.product, index));

  summary.push({ Товар: mapping.product, Фото: paths.length, Статус: 'создан черновиком' });
}

console.log(`\nСкопировано файлов: ${copied}, переиспользовано: ${reused}`);
console.table(summary);
console.log('Товары созданы черновиками — на сайте они не видны, пока вы их не опубликуете.\n');

closeDb();
