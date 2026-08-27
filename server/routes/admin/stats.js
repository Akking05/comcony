import { Router } from 'express';
import { getDb } from '../../db/index.js';

export const statsRouter = Router();

/**
 * Сводка для дашборда. Аналитика считается запросами по analytics_events,
 * отдельных счётчиков не держим — на объёмах этого сайта это дешевле.
 */
statsRouter.get('/', (req, res) => {
  const db = getDb();
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
  const since = `-${days} days`;

  const scalar = (sql, ...params) => db.prepare(sql).get(...params).value;

  res.json({
    period_days: days,

    products: {
      total: scalar('SELECT COUNT(*) AS value FROM products'),
      published: scalar("SELECT COUNT(*) AS value FROM products WHERE status = 'published'"),
      draft: scalar("SELECT COUNT(*) AS value FROM products WHERE status = 'draft'"),
    },

    requests: {
      total: scalar('SELECT COUNT(*) AS value FROM requests'),
      new: scalar("SELECT COUNT(*) AS value FROM requests WHERE status = 'new'"),
      period: scalar(
        "SELECT COUNT(*) AS value FROM requests WHERE created_at >= datetime('now', ?)",
        since,
      ),
    },

    traffic: {
      visits: scalar(
        "SELECT COUNT(*) AS value FROM analytics_events WHERE type = 'visit' AND created_at >= datetime('now', ?)",
        since,
      ),
      product_views: scalar(
        "SELECT COUNT(*) AS value FROM analytics_events WHERE type = 'product_view' AND created_at >= datetime('now', ?)",
        since,
      ),
    },

    // График по дням: [{ day: '2026-08-27', visits: 12, requests: 1 }]
    daily: db
      .prepare(`
        SELECT date(created_at) AS day,
               SUM(CASE WHEN type = 'visit' THEN 1 ELSE 0 END) AS visits,
               SUM(CASE WHEN type = 'product_view' THEN 1 ELSE 0 END) AS product_views,
               SUM(CASE WHEN type = 'request' THEN 1 ELSE 0 END) AS requests
        FROM analytics_events
        WHERE created_at >= datetime('now', ?)
        GROUP BY day ORDER BY day
      `)
      .all(since),

    // Самые просматриваемые товары за период
    top_products: db
      .prepare(`
        SELECT p.name, p.slug, COUNT(*) AS views
        FROM analytics_events e
        JOIN products p ON p.id = e.product_id
        WHERE e.type = 'product_view' AND e.created_at >= datetime('now', ?)
        GROUP BY p.id ORDER BY views DESC LIMIT 10
      `)
      .all(since),

    latest_requests: db
      .prepare(`
        SELECT r.id, r.name, r.email, r.subject, r.status, r.created_at, p.name AS product_name
        FROM requests r LEFT JOIN products p ON p.id = r.product_id
        ORDER BY r.created_at DESC, r.id DESC LIMIT 5
      `)
      .all(),
  });
});
