import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** Текущая версия схемы. Поднимать при добавлении миграций. */
const SCHEMA_VERSION = 1;

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
 * Применяет схему. Все CREATE — IF NOT EXISTS, поэтому вызов идемпотентен.
 */
function migrate(database) {
  const current = database.prepare('PRAGMA user_version').get().user_version;

  if (current >= SCHEMA_VERSION) return;

  database.exec(readFileSync(join(here, 'schema.sql'), 'utf8'));
  database.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

/**
 * Закрывает подключение (используется в скриптах и тестах).
 */
export function closeDb() {
  if (!db) return;

  db.close();
  db = null;
}
