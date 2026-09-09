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
// Витрине сервера взять неоткуда, поэтому подстановку русского вместо пустого
// перевода делаем здесь же, при сборке снимка, и складываем два готовых
// набора: products/details — русский, products_en/details_en — английский.
/** Как COALESCE(NULLIF(x_en, ''), x) в публичном API, только в JS. */
const pick = (row, field, lang) => (lang === 'en' ? row[`${field}_en`] || row[field] : row[field]);

const productRows = db
  .prepare(`
    SELECT p.id, p.slug, p.name, p.name_en, p.short_description, p.short_description_en,
           p.full_description, p.full_description_en, p.main_image, p.badge, p.badge_en,
           c.name AS category, c.name_en AS category_en, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.status = 'published'
    ORDER BY p.sort, p.id
  `)
  .all();

const specRows = new Map();
const imageRows = new Map();
const applicationRows = new Map();
const documentRows = new Map();

for (const product of productRows) {
  specRows.set(
    product.id,
    db
      .prepare(`
        SELECT spec_group, spec_group_en, name, name_en, value, value_en, is_key
        FROM product_specs WHERE product_id = ? ORDER BY sort, id
      `)
      .all(product.id),
  );
  imageRows.set(
    product.id,
    db.prepare('SELECT path, alt, alt_en FROM product_images WHERE product_id = ? ORDER BY sort, id').all(product.id),
  );
  applicationRows.set(
    product.id,
    db
      .prepare(`
        SELECT title, title_en, description, description_en
        FROM product_applications WHERE product_id = ? ORDER BY sort, id
      `)
      .all(product.id),
  );
  documentRows.set(
    product.id,
    db
      .prepare(`
        SELECT title, title_en, file_path, file_size, type
        FROM documents WHERE product_id = ? AND status = 'published' ORDER BY sort, id
      `)
      .all(product.id),
  );
}

/** Каталог на одном языке — ровно та форма, что отдаёт GET /api/products. */
const catalogFor = (lang) =>
  productRows.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: pick(product, 'name', lang),
    short_description: pick(product, 'short_description', lang),
    main_image: product.main_image,
    badge: pick(product, 'badge', lang),
    category: pick(product, 'category', lang),
    category_slug: product.category_slug,
  }));

/** Страницы товаров на одном языке — форма GET /api/products/:slug. */
const detailsFor = (lang) => {
  const result = {};

  for (const product of productRows) {
    const specs = specRows.get(product.id);

    const groups = [];
    for (const spec of specs.filter((item) => !item.is_key)) {
      const title = pick(spec, 'spec_group', lang) || '';
      let group = groups.find((item) => item.title === title);

      if (!group) {
        group = { title, items: [] };
        groups.push(group);
      }

      group.items.push({ name: pick(spec, 'name', lang), value: pick(spec, 'value', lang) });
    }

    result[product.slug] = {
      id: product.id,
      slug: product.slug,
      name: pick(product, 'name', lang),
      short_description: pick(product, 'short_description', lang),
      full_description: pick(product, 'full_description', lang),
      main_image: product.main_image,
      badge: pick(product, 'badge', lang),
      category: pick(product, 'category', lang),
      category_slug: product.category_slug,
      key_specs: specs
        .filter((item) => item.is_key)
        .map((item) => ({ name: pick(item, 'name', lang), value: pick(item, 'value', lang) })),
      spec_groups: groups,
      gallery: imageRows.get(product.id).map((image) => ({ path: image.path, alt: pick(image, 'alt', lang) })),
      applications: applicationRows
        .get(product.id)
        .map((item) => ({ title: pick(item, 'title', lang), description: pick(item, 'description', lang) })),
      documents: documentRows.get(product.id).map((item) => ({
        title: pick(item, 'title', lang),
        file_path: item.file_path,
        file_size: item.file_size,
        type: item.type,
      })),
    };
  }

  return result;
};

const products = catalogFor('ru');
const details = detailsFor('ru');
const productsEn = catalogFor('en');
const detailsEn = detailsFor('en');

// --- Тексты и команда -------------------------------------------------------
const textRows = db.prepare('SELECT key, value, value_en FROM texts').all();

const texts = Object.fromEntries(textRows.map((row) => [row.key, row.value]));
const textsEn = Object.fromEntries(textRows.map((row) => [row.key, row.value_en || row.value]));

const memberRows = db
  .prepare('SELECT name, name_en, position, position_en, photo, tags FROM team_members ORDER BY sort, id')
  .all();

const teamFor = (lang) =>
  memberRows.map((member) => ({
    name: pick(member, 'name', lang),
    position: pick(member, 'position', lang),
    photo: member.photo,
    tags: member.tags ? member.tags.split(',') : [],
  }));

const team = teamFor('ru');
const teamEn = teamFor('en');

// --- Картинки, на которые ссылается снимок ----------------------------------
// Копируем только используемые файлы, чтобы не тащить в сборку всю медиатеку.
const referenced = new Set();

const collect = (path) => {
  if (typeof path === 'string' && path.startsWith('/uploads/')) referenced.add(path.replace('/uploads/', ''));
};

products.forEach((product) => collect(product.main_image));
// Снимки галереи и постер видео задаются в текстах, а не привязаны к товару.
// Без этого прохода на витрине они превратились бы в битые ссылки.
Object.values(texts).forEach(collect);
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

writeFileSync(
  OUTPUT,
  JSON.stringify(
    {
      products,
      products_en: productsEn,
      details,
      details_en: detailsEn,
      texts,
      texts_en: textsEn,
      team,
      team_en: teamEn,
    },
    null,
    2,
  ),
  'utf8',
);

console.log(`\nСнимок: ${OUTPUT}`);
console.table({
  товаров: products.length,
  'страниц товаров': Object.keys(details).length,
  текстов: Object.keys(texts).length,
  'из них переведено': textRows.filter((row) => row.value_en).length,
  'команда': team.length,
  'файлов скопировано': copied,
});
console.log('Не забудьте закоммитить public/demo-data.json и public/uploads/\n');

closeDb();
