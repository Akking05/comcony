import { useEffect } from 'react';

/**
 * Шрифт иконок админки.
 *
 * Публичный сайт рисует иконки штрихом (`components/ui/Icon.jsx`) и
 * ни одного внешнего шрифта не грузит: там мир, где иконка — это чертёж,
 * а не глиф. Админка осталась на Material Symbols — она рабочий
 * инструмент, её вид не обсуждался, и переписывать полсотни её иконок
 * ради этого прогона значило бы трогать то, что работает.
 *
 * Поэтому таблица стилей иконок больше не висит в index.html на каждой
 * странице сайта, а приезжает вместе с чанком админки — один раз,
 * при первом её открытии.
 */
const HREF =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';

export function useIconFont() {
  useEffect(() => {
    if (document.querySelector('link[data-admin-icons]')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = HREF;
    link.dataset.adminIcons = 'true';
    document.head.append(link);
  }, []);
}
