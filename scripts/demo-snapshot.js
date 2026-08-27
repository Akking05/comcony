/**
 * Снимок опубликованных данных для витринного показа на статическом хостинге.
 *
 * ВРЕМЕННОЕ РЕШЕНИЕ на период, пока сайт показывают с Vercel. После переезда
 * на VPS всё это не нужно: удалите public/demo-data.json, public/uploads и
 * скрипты demo:* — сайт возьмёт данные из API.
 *
 *   npm run demo:snapshot   — собрать снимок из локальной БД
 *
 * Снимок и картинки коммитятся в репозиторий, потому что на Vercel нет ни
 * базы, ни папки загрузок.
 */
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, closeDb } from '../server/db/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const UPLOAD_DIR = process.env.KAE_UPLOAD_DIR || join(root, 'server', 'uploads');
const PUBLIC_UPLOADS = join(root, 'public', 'uploads');
const OUTPUT = join(root, 'public', 'demo-data.json');

const db = getDb();

// --- Каталог ----------------------------------------------------------------
const products = db
  .prepare(`
    SELECT p.id, p.slug, p.name, p.short_description, p.main_image, p.badge,
           c.name AS category, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.status = 'published'
    ORDER BY p.sort, p.id
  `)
  .all();

// --- Страницы товаров -------------------------------------------------------
const details = {};

for (const product of products) {
  const specs = db
    .prepare('SELECT spec_group, name, value, is_key FROM product_specs WHERE product_id = ? ORDER BY sort, id')
    .all(product.id);

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

  details[product.slug] = {
    ...product,
    full_description: db.prepare('SELECT full_description FROM products WHERE id = ?').get(product.id)
      .full_description,
    key_specs: specs.filter((item) => item.is_key).map(({ name, value }) => ({ name, value })),
    spec_groups: groups,
    gallery: db
      .prepare('SELECT path, alt FROM product_images WHERE product_id = ? ORDER BY sort, id')
      .all(product.id),
    applications: db
      .prepare('SELECT title, description FROM product_applications WHERE product_id = ? ORDER BY sort, id')
      .all(product.id),
    documents: db
      .prepare(
        "SELECT title, file_path, file_size, type FROM documents WHERE product_id = ? AND status = 'published' ORDER BY sort, id",
      )
      .all(product.id),
  };
}

// --- Тексты и команда -------------------------------------------------------
const texts = Object.fromEntries(
  db.prepare('SELECT key, value FROM texts').all().map((row) => [row.key, row.value]),
);

const team = db
  .prepare('SELECT name, position, photo, tags FROM team_members ORDER BY sort, id')
  .all()
  .map((member) => ({ ...member, tags: member.tags ? member.tags.split(',') : [] }));

// --- Картинки, на которые ссылается снимок ----------------------------------
// Копируем только используемые файлы, чтобы не тащить в сборку всю медиатеку.
const referenced = new Set();

const collect = (path) => {
  if (typeof path === 'string' && path.startsWith('/uploads/')) referenced.add(path.replace('/uploads/', ''));
};

products.forEach((product) => collect(product.main_image));
Object.values(details).forEach((detail) => {
  detail.gallery.forEach((image) => collect(image.path));
  detail.documents.forEach((document) => collect(document.file_path));
});
team.forEach((member) => collect(member.photo));

rmSync(PUBLIC_UPLOADS, { recursive: true, force: true });

let copied = 0;
if (referenced.size) {
  mkdirSync(PUBLIC_UPLOADS, { recursive: true });

  for (const name of referenced) {
    const source = join(UPLOAD_DIR, name);

    if (!existsSync(source)) {
      console.warn(`  файл не найден, пропущен: ${name}`);
      continue;
    }

    copyFileSync(source, join(PUBLIC_UPLOADS, name));
    copied += 1;
  }
}

writeFileSync(OUTPUT, JSON.stringify({ products, details, texts, team }, null, 2), 'utf8');

console.log(`\nСнимок: ${OUTPUT}`);
console.table({
  товаров: products.length,
  'страниц товаров': Object.keys(details).length,
  текстов: Object.keys(texts).length,
  'команда': team.length,
  'файлов скопировано': copied,
});
console.log('Не забудьте закоммитить public/demo-data.json и public/uploads/\n');

closeDb();
