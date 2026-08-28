/**
 * Ограничение частоты запросов в памяти процесса.
 *
 * Отдельный пакет не нужен: процесс один, воркеров нет, а терять состояние
 * лимита при перезапуске не страшно — окно короткое.
 *
 * Окно фиксированное, а не скользящее: на границе окна теоретически можно
 * пройти двойной лимит. Для защиты формы от скриптов этого достаточно,
 * а кода в разы меньше.
 */

const SWEEP_INTERVAL = 5 * 60 * 1000;

/**
 * @param {object} options
 * @param {number} options.limit    сколько запросов разрешено за окно
 * @param {number} options.windowMs длина окна в миллисекундах
 * @param {string} options.message  что показать клиенту при превышении
 */
export function rateLimit({ limit, windowMs, message }) {
  const hits = new Map();

  // Уборка просроченных ключей. Без неё карта росла бы на каждый новый IP
  // и никогда не уменьшалась. unref — чтобы таймер не держал процесс живым.
  const sweeper = setInterval(() => {
    const now = Date.now();

    for (const [key, entry] of hits) {
      if (now - entry.first > windowMs) hits.delete(key);
    }
  }, SWEEP_INTERVAL);

  sweeper.unref?.();

  return (req, res, next) => {
    // req.ip корректен благодаря `trust proxy` — иначе здесь был бы
    // адрес nginx, общий для всех посетителей.
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.first > windowMs) {
      hits.set(key, { count: 1, first: now });
      return next();
    }

    entry.count += 1;

    if (entry.count > limit) {
      const retryAfter = Math.ceil((entry.first + windowMs - now) / 1000);

      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: message, retry_after: retryAfter });
    }

    next();
  };
}
