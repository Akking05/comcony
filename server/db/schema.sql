-- Схема БД сайта KAE Engineering (SQLite)
-- Версия схемы хранится в PRAGMA user_version, см. server/db/index.js

-- ---------------------------------------------------------------------------
-- Пользователи админки
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- ---------------------------------------------------------------------------
-- Категории продукции
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  sort        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- Продукция
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  category_id       INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  short_description TEXT NOT NULL DEFAULT '',
  full_description  TEXT NOT NULL DEFAULT '',
  main_image        TEXT NOT NULL DEFAULT '',
  -- Плашка поверх картинки на карточке каталога ("SYSTEM ACTIVE", "HI-RES DATA").
  -- Пустая строка — плашка не выводится.
  badge             TEXT NOT NULL DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort              INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_status_sort ON products(status, sort);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);

-- ---------------------------------------------------------------------------
-- Технические характеристики.
-- Полностью динамические: админ заводит произвольные группы и строки,
-- фиксированных колонок под конкретные ТТХ нет.
--   spec_group = 'Оптические',   name = 'Дальность обнаружения', value = '12 км'
--   spec_group = 'Эксплуатация', name = 'Рабочая температура',   value = '-40°C…+55°C'
-- is_key = 1 — характеристика попадает в блок ключевых ТТХ на странице товара.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_specs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  spec_group TEXT NOT NULL DEFAULT '',
  name       TEXT NOT NULL,
  value      TEXT NOT NULL DEFAULT '',
  is_key     INTEGER NOT NULL DEFAULT 0 CHECK (is_key IN (0, 1)),
  sort       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_specs_product ON product_specs(product_id, sort);

-- ---------------------------------------------------------------------------
-- Галерея товара
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  path       TEXT NOT NULL,
  alt        TEXT NOT NULL DEFAULT '',
  sort       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id, sort);

-- ---------------------------------------------------------------------------
-- Области применения товара
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_applications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort        INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_applications_product ON product_applications(product_id, sort);

-- ---------------------------------------------------------------------------
-- Документация (PDF), привязанная к товару
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  file_path  TEXT NOT NULL,
  file_size  INTEGER NOT NULL DEFAULT 0,
  type       TEXT NOT NULL DEFAULT 'datasheet',
  status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_documents_product ON documents(product_id, sort);

-- ---------------------------------------------------------------------------
-- Редактируемые тексты сайта (контакты, «О компании»).
-- Ключ-значение, чтобы добавлять новые поля без миграций.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS texts (
  key        TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  value      TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'textarea')),
  group_name TEXT NOT NULL DEFAULT 'general',
  sort       INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_texts_group ON texts(group_name, sort);

-- ---------------------------------------------------------------------------
-- Команда («О компании»)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_members (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT '',
  photo    TEXT NOT NULL DEFAULT '',
  tags     TEXT NOT NULL DEFAULT '',
  sort     INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Заявки с сайта (клиенты)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS requests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  subject    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL DEFAULT '',
  -- Товар, по которому оставлена заявка (NULL — общее обращение с /contacts)
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done', 'spam')),
  note       TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_requests_status  ON requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_product ON requests(product_id);

-- ---------------------------------------------------------------------------
-- Аналитика: сырые события, агрегация делается запросами
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT NOT NULL CHECK (type IN ('visit', 'product_view', 'request')),
  path       TEXT NOT NULL DEFAULT '',
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  referrer   TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type    ON analytics_events(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_product ON analytics_events(product_id);
