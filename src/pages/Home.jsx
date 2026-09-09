import { useMemo } from 'react';

import { useApi } from '../hooks/useApi.js';
import { api } from '../lib/api.js';
import { useLang } from '../lib/i18n.jsx';

import '../components/home/home.css';
import { numeral } from '../components/home/motion.js';
import { PART_ORDER } from '../components/home/heroLayout.js';
import { Hero } from '../components/home/sections/Hero.jsx';
import { Status } from '../components/home/sections/Status.jsx';
import { Directions } from '../components/home/sections/Directions.jsx';
import { Doing } from '../components/home/sections/Doing.jsx';
import { Nomenclature } from '../components/home/sections/Nomenclature.jsx';
import { Supply } from '../components/home/sections/Supply.jsx';
import { Documents } from '../components/home/sections/Documents.jsx';
import { Kromka } from '../components/home/sections/Kromka.jsx';

/**
 * Главная страница: восемь экранов упаковочного листа.
 *
 * Порядок и устройство экранов:
 *   1 кофр — закрытый ящик раскрывается, рация расходится на шесть частей;
 *   2 статус — полоса трафаретной маркировки в край экрана;
 *   3 направления — клейма по борту, без рамок и общего габарита;
 *   4 что делаем — асимметричный сплит 5/7 с разобранным узлом;
 *   5 номенклатура — плотное поле позиций в край, единственная плотная секция;
 *   6 поставка — ось маршрута с пятью отметками;
 *   7 документы — таблица «графа → значение»;
 *   8 нижняя кромка — знаки обращения с грузом и адрес назначения.
 * Два соседних экрана нигде не повторяют структурный тип, и у каждого своё
 * движение по скроллу.
 *
 * Фотографий здесь нет ни одной: вся графика — ручной SVG и CSS. Это прямое
 * решение заказчика, фотографии живут только в каталоге и карточке позиции.
 *
 * Откуда берётся текст. Из базы (`texts`, группа «Главная») — всё, что правит
 * владелец сайта, и каждая его строка стоит там, где встаёт в две строки:
 *   · `hero_title_1` + `hero_title_2` — заголовок первого экрана;
 *   · `hero_eyebrow` — строка под ним;
 *   · `advantage_1…3` — три подписи под утверждением о статусе;
 *   · `systems_title` + `hero_text` — заголовок и абзац «что делаем»;
 *   · `systems_text` — строка под заголовком поставки;
 *   · `contacts.address` — адрес назначения на нижней кромке.
 * Из базы же (`products`, `categories`) — направления и позиции номенклатуры.
 * Из локалей — то, что принадлежит самой странице: подписи экранов, названия
 * частей на чертеже, узлы поставки и графы документов.
 * Своих строк у страницы нет вовсе. Чего нет в базе — заглушка `[ … ]`, и она
 * выглядит заглушкой: ни одной выдуманной цифры, цены или характеристики.
 */

/** Экраны с номером. Отсюда же строится указатель в рельсе первого экрана. */
const SCREENS = [
  { key: 'status', anchor: 'status', labelKey: 'home.screen_status' },
  { key: 'directions', anchor: 'napravleniya', labelKey: 'home.screen_directions' },
  { key: 'doing', anchor: 'chto-delaem', labelKey: 'home.screen_doing' },
  { key: 'nomenclature', anchor: 'nomenklatura', labelKey: 'home.screen_nomenclature' },
  { key: 'supply', anchor: 'postavka', labelKey: 'home.screen_supply' },
  { key: 'documents', anchor: 'dokumenty', labelKey: 'home.screen_documents' },
];

/** Пять узлов маршрута поставки: от проектирования до сервиса. */
const SUPPLY_NODES = ['design', 'install', 'commissioning', 'training', 'service'];

/** Графы упаковочного листа. Значений у заказчика ещё нет — справа заглушка. */
const DOCUMENT_ROWS = [
  'home.document_partner',
  'home.document_conformity',
  'home.document_permits',
  'home.document_spec',
  'home.document_warranty',
  'home.document_delivery',
];

/** Сколько клейм помещается на борту, не превращаясь в решётку карточек. */
const MAX_DIRECTIONS = 4;

/** Сколько позиций держит поле номенклатуры: дальше читатель уходит в каталог. */
const MAX_ITEMS = 12;

/** Три подписи под утверждением о статусе — тексты владельца сайта из базы. */
const SIGNATURE_KEYS = [1, 2, 3];

export default function Home() {
  const { lang, t } = useLang();
  // lang в зависимостях: смена языка — это новый запрос за текстами.
  const { data: texts } = useApi((signal) => api.texts(lang, signal), [lang]);
  const { data: products, loading, error } = useApi((signal) => api.products(lang, signal), [lang]);

  const text = (key, fallback = '') => texts?.[key] ?? fallback;

  const screens = SCREENS.map((screen) => ({ ...screen, label: t(screen.labelKey) }));
  const ghostOf = (key) => numeral(SCREENS.findIndex((screen) => screen.key === key));
  const catalog = { label: t('common.catalog'), href: '/products' };

  const parts = PART_ORDER.map((id) => ({
    id,
    name: t(`home.part_${id}`),
    role: t(`home.part_${id}_role`),
  }));

  const signatures = SIGNATURE_KEYS.map((index) => ({
    title: text(`home.advantage_${index}_title`),
    line: text(`home.advantage_${index}_text`),
  })).filter((signature) => signature.title);

  const claims = [
    t('home.partner_status'),
    t('home.claim_2'),
    t('home.claim_3'),
    t('home.claim_4'),
  ];

  const items = useMemo(() => (products ?? []).slice(0, MAX_ITEMS), [products]);

  // Направление — это категория, у которой есть опубликованные позиции.
  // Пустая категория не набивается на борт: клеймо обещало бы номенклатуру,
  // которой в каталоге нет.
  const directions = useMemo(() => {
    const seen = new Map();

    for (const product of products ?? []) {
      if (!product.category_slug || seen.has(product.category_slug)) continue;

      seen.set(product.category_slug, {
        slug: product.category_slug,
        title: product.category,
        line: '',
      });
    }

    return Array.from(seen.values()).slice(0, MAX_DIRECTIONS);
  }, [products]);

  // Адрес назначения — из контактов в базе, строка в строку.
  const address = String(text('contacts.address'))
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const title1 = text('home.hero_title_1', t('home.hero_title_1'));
  const title2 = text('home.hero_title_2', t('home.hero_title_2'));

  return (
    <main className="kns-home">
      <Hero
        t={t}
        wordmark="KAE Engineering"
        status={t('home.partner_status')}
        title={
          <>
            <span className="block">{title1}</span>
            <span className="block">{title2}</span>
          </>
        }
        lead={text('home.hero_eyebrow', t('home.hero_eyebrow'))}
        parts={parts}
        caption={t('home.radio_caption')}
        screens={screens}
        catalog={catalog}
      />

      <Status
        anchor="status"
        rail={t('home.screen_status')}
        ghost={ghostOf('status')}
        statement={t('home.status_statement')}
        signatures={signatures}
      />

      <Directions
        anchor="napravleniya"
        rail={t('home.screen_directions')}
        ghost={ghostOf('directions')}
        title={t('home.directions_title')}
        items={directions}
        placeholderLabel={t('home.direction_application')}
        emptyNote={error ? t('products.error_text') : t('products.empty_text')}
      />

      <Doing
        anchor="chto-delaem"
        rail={t('home.screen_doing')}
        ghost={ghostOf('doing')}
        title={text('home.systems_title', t('home.systems_title'))}
        paragraph={text('home.hero_text')}
        claims={claims}
      />

      <Nomenclature
        anchor="nomenklatura"
        rail={t('home.screen_nomenclature')}
        ghost={ghostOf('nomenclature')}
        title={t('home.nomenclature_title')}
        note={t('home.nomenclature_note')}
        items={items}
        loading={loading}
        failed={Boolean(error)}
        empty={{ title: t('products.empty_title'), text: t('products.empty_text') }}
        error={{ title: t('products.error_title'), text: t('products.error_text') }}
        articleLabel={t('home.article')}
        priceLabel={t('common.price_on_request')}
        catalog={catalog}
      />

      <Supply
        anchor="postavka"
        rail={t('home.screen_supply')}
        ghost={ghostOf('supply')}
        title={t('home.supply_title')}
        lead={text('home.systems_text')}
        nodes={SUPPLY_NODES.map((id) => ({
          id,
          title: t(`home.supply_${id}`),
          line: t(`home.supply_${id}_line`),
        }))}
      />

      <Documents
        anchor="dokumenty"
        rail={t('home.screen_documents')}
        ghost={ghostOf('documents')}
        title={t('home.documents_title')}
        rows={DOCUMENT_ROWS.map((key) => t(key))}
        note={t('home.documents_note')}
        valueLabel={t('home.value')}
      />

      <Kromka t={t} destination={t('home.destination')} address={address} catalog={catalog} />
    </main>
  );
}
