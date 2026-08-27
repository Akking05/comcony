const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
  // казахские буквы
  ә: 'a', ғ: 'g', қ: 'k', ң: 'n', ө: 'o', ұ: 'u', ү: 'u', һ: 'h', і: 'i',
};

/**
 * Превращает произвольную строку в slug: «Носимая с экраном» → «nosimaya-s-ekranom».
 */
export function slugify(input) {
  const base = String(input ?? '')
    .toLowerCase()
    .split('')
    .map((char) => (char in TRANSLIT ? TRANSLIT[char] : char))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || 'item';
}

/**
 * Возвращает slug, свободный в таблице. При занятости добавляет -2, -3 и т.д.
 * excludeId позволяет не конфликтовать с самой редактируемой записью.
 */
export function uniqueSlug(db, table, desired, excludeId = null) {
  const base = slugify(desired);
  const query = db.prepare(`SELECT id FROM ${table} WHERE slug = ?`);

  let candidate = base;
  let counter = 2;

  for (;;) {
    const existing = query.get(candidate);
    if (!existing || existing.id === excludeId) return candidate;

    candidate = `${base}-${counter}`;
    counter += 1;
  }
}
