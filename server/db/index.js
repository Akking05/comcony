import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Миграции по порядку. Индекс + 1 — это значение PRAGMA user_version после
 * применения шага, поэтому новые шаги дописываются только в конец списка.
 *
 * schema.sql остаётся описанием базы «с нуля»: в нём сразу всё, что есть на
 * сегодня. Существующей базе он ничем не поможет — CREATE TABLE IF NOT EXISTS
 * не добавит колонку в уже созданную таблицу, — поэтому каждое изменение
 * таблицы дублируется здесь отдельным шагом.
 */
const MIGRATIONS = [
  // 1 — базовая схема
  (database) => database.exec(readFileSync(join(here, 'schema.sql'), 'utf8')),

  // 2 — английские значения текстов сайта
  (database) => addColumn(database, 'texts', 'value_en', "TEXT NOT NULL DEFAULT ''"),

  // 3 — английские значения каталога и команды
  (database) => {
    const translated = {
      categories: ['name', 'description'],
      products: ['name', 'short_description', 'full_description', 'badge'],
      product_specs: ['spec_group', 'name', 'value'],
      product_images: ['alt'],
      product_applications: ['title', 'description'],
      documents: ['title'],
      team_members: ['name', 'position'],
    };

    for (const [table, fields] of Object.entries(translated)) {
      for (const field of fields) {
        addColumn(database, table, `${field}_en`, "TEXT NOT NULL DEFAULT ''");
      }
    }
  },
];

const SCHEMA_VERSION = MIGRATIONS.length;

/**
 * Добавляет колонку, если её ещё нет.
 *
 * ALTER TABLE ADD COLUMN на существующей колонке — ошибка, а не «ничего не
 * делать». Шаг миграции должен переживать повторный запуск: на свежей базе
 * колонка уже приехала из schema.sql.
 */
function addColumn(database, table, column, definition) {
  const exists = database
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .some((row) => row.name === column);

  if (exists) return;

  database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

/** Путь к файлу БД. Переопределяется через KAE_DB_PATH (удобно для тестов и деплоя). */
export const DB_PATH = process.env.KAE_DB_PATH || join(here, '..', 'data', 'kae.db');

let db = null;

/**
 * Возвращает singleton-подключение, создавая файл и схему при первом обращении.
 */
export function getDb() {
  if (db) return db;

  mkdirSync(dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);

  // WAL — параллельное чтение во время записи; FK — каскадные удаления из схемы.
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  migrate(db);

  return db;
}

/**
 * Догоняет базу до текущей версии схемы, применяя недостающие шаги.
 * Вызов идемпотентен: применённые шаги пропускаются по user_version.
 */
function migrate(database) {
  const current = database.prepare('PRAGMA user_version').get().user_version;

  if (current >= SCHEMA_VERSION) return;

  for (let step = current; step < SCHEMA_VERSION; step += 1) {
    MIGRATIONS[step](database);

    // Версия поднимается после каждого шага: если следующий упадёт,
    // уже применённые не станут применяться повторно.
    database.exec(`PRAGMA user_version = ${step + 1}`);
  }
}

/**
 * Закрывает подключение (используется в скриптах и тестах).
 */
export function closeDb() {
  if (!db) return;

  db.close();
  db = null;
}
