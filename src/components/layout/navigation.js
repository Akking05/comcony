/**
 * Пункты меню. Подпись хранится ключом словаря, а не готовой строкой:
 * шапка и выдвижное меню берут её из i18n и обновляются при смене языка.
 */
export const NAV_LINKS = [
  { path: '/', labelKey: 'nav.home' },
  { path: '/products', labelKey: 'nav.products' },
  { path: '/about', labelKey: 'nav.about' },
  { path: '/contacts', labelKey: 'nav.contacts' },
];
