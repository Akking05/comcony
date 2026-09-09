/**
 * Перенос демонстрационных данных из JSX в БД.
 *
 * Все тексты и картинки взяты один в один из src/pages/*.jsx, чтобы после
 * перевода фронтенда на API страницы выглядели ровно так же, как сейчас.
 *
 *   npm run db:seed    — досоздать недостающие записи (существующие не трогает)
 *   npm run db:reset   — очистить контентные таблицы и залить заново
 */
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { getDb, closeDb, DB_PATH } from './index.js';

const RESET = process.argv.includes('--reset');

// ---------------------------------------------------------------------------
// Данные
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { slug: 'drones', name: 'Беспилотные системы', name_en: 'Unmanned systems' },
  { slug: 'electronics', name: 'Электронное оборудование', name_en: 'Electronic equipment' },
  { slug: 'engineering-systems', name: 'Инженерные комплексы', name_en: 'Engineering systems' },
  { slug: 'surveillance', name: 'Системы наблюдения', name_en: 'Surveillance systems' },
  { slug: 'automation', name: 'Промышленная автоматика', name_en: 'Industrial automation' },
  { slug: 'research', name: 'Перспективные разработки', name_en: 'Advanced research' },
];

const IMG = 'https://lh3.googleusercontent.com/aida-public/';

const PRODUCTS = [
  {
    slug: 'series-x',
    name: 'Series-X',
    category: 'drones',
    badge: 'SYSTEM ACTIVE',
    short_description: 'Автономные решения для разведки и логистики.',
    short_description_en: 'Autonomous solutions for reconnaissance and logistics.',
    full_description:
      'Автономные решения для разведки и логистики. Designed for high-intensity reconnaissance and rapid deployment. The Series-X represents the pinnacle of autonomous flight research, engineered for complex industrial and tactical applications.',
    full_description_en:
      'Autonomous solutions for reconnaissance and logistics. Designed for high-intensity reconnaissance and rapid deployment. The Series-X represents the pinnacle of autonomous flight research, engineered for complex industrial and tactical applications.',
    main_image: `${IMG}AB6AXuDD6x6uTf6vNd4PCzVVmnY_29gRbXsolGYsuBQ1T8csAICDEYj7zaW0lonjfDgPbKdxNmfdOd_x-YrWsIS_dbw8JqxqNazeBr_wBWc1iMGNy3D033Rble_99l1JjNV6DEjv7BtkC4oKWlg3HtKsyb6nll9_JhYw8wbFqXaP13ICPSaoHsJdGCu57PlxjFDRyhYV8uiXdA4ESTKKHaEDOkXMHGagiGPs2s_BY3LUueevZi1eskS6dbKAhDxcIzLtTLVj71FcXN2IGI4`,
    specs: [
      { group: '', name: 'Max Altitude', value: '5000 m', is_key: 1 },
      { group: '', name: 'Payload', value: '15 kg', is_key: 1 },
    ],
  },
  {
    slug: 'precision-core',
    name: 'Precision-Core',
    category: 'electronics',
    badge: 'HI-RES DATA',
    short_description: 'Высокоточная электроника для критически важных систем.',
    short_description_en: 'High-precision electronics for mission-critical systems.',
    full_description: 'Высокоточная электроника для критически важных систем.',
    full_description_en: 'High-precision electronics for mission-critical systems.',
    main_image: `${IMG}AB6AXuAS_63Kua_g7zgZvD35_9I8lrQKbPZnLCZYBjuaTCTh90zpFgZLVmcrhr7HF7Y0jyLEZI7RtWo1aNgV9joWFU3oT6_ygo5I_d-tZQ0cBm7Rf3Coi01NBbg_8E2Og1zIMPUbkQD8BMJql9-YUYXRPWTMj6gPgExPDhZTmoXXELKke8_z6uUq-gn4eSoOyJkt1sSEfzeCmq7mPOpkDxPlTnG8kuSo3O3bEwbPalWkVFlD2zz5QLCwWaz479Dnbtvl2jFIsEe4LlVM_rY`,
    specs: [],
  },
  {
    slug: 'modular-x',
    name: 'Modular-X',
    category: 'engineering-systems',
    badge: '',
    short_description: 'Масштабные модульные системы для индустрии.',
    short_description_en: 'Large-scale modular systems for industry.',
    full_description: 'Масштабные модульные системы для индустрии.',
    full_description_en: 'Large-scale modular systems for industry.',
    main_image: `${IMG}AB6AXuB1Nm2DU0btOBWgFXfjwTDYEVrkQbR3dWj5uUzRj8k7mnYN_Ezs1y86aCCAGFS2lb9R3OpkMFbMGkIJzQxjAi9m2Zn9QgSnvR1cpecJCDMIcKO4xNwabX97SDbyv7S02k0nb_cZgqJsHg4EkpwRvxYicc-RMHxqGG9lO-NRkonqcXXIcz3UdtdwCZx1Q92cFRSpHAhicbvnQfnSwu6LFs-CKIBSUilk3S9qzizG_aKQTDews41T8kRXwU3Olff86w1buk_YTFCWGGU`,
    specs: [],
  },
  {
    slug: 'aegis-vision',
    name: 'Aegis-Vision',
    category: 'surveillance',
    badge: '',
    short_description: 'Интеллектуальный мониторинг и безопасность.',
    short_description_en: 'Intelligent monitoring and security.',
    full_description: 'Интеллектуальный мониторинг и безопасность.',
    full_description_en: 'Intelligent monitoring and security.',
    main_image: `${IMG}AB6AXuBjySDmA2EvBqieaEux147dq7-vuU6mh5mrUtT18XMdVSZjvDbbxnxbxPXqC5FmfbICOIN_VK_9MW4155xrTKNFbxbFgCFJQj7CPprBIGmm0JkD4EFuYC7W4zyMJcTM0QXwkB_cJaSN3jR6wglAWugxpLFscTevra_7aIlEgHWtxbdlpn-iXimMnYAcPk0AYHAe0iiaWWIq60KPRfA1LNWGjrLIrRVtl3GxP3_m1W4jwq3H7uKfg0-oC84wyjSLm73nVCoU6xozJpI`,
    specs: [],
  },
  {
    slug: 'forge-os',
    name: 'Forge-OS',
    category: 'automation',
    badge: '',
    short_description: 'Роботизированные линии нового поколения.',
    short_description_en: 'Next-generation robotic production lines.',
    full_description: 'Роботизированные линии нового поколения.',
    full_description_en: 'Next-generation robotic production lines.',
    main_image: `${IMG}AB6AXuAP63A1T4qtx1dKk2aLoNzU85FmF6yvzA8pqWIZ-HzPyrqRWMiqgyejyBdo26w_oTN1HPcScMtVmCbl-nh1Vu8fgIQEmnu-IzV_Z235UcjY4ofxgPMGnoF-ZlmdDphK3PIfDzIvyIvLmu3NHrtgcTkGVslCzTJPcBlggfV8xuzSQCznjV3FOheKUpQGiUueIIdu_47iWfVe7D0ppJ6I-mJ1AvYNyQPNxQTW-KwI9RDlzIMGI87QM6i7tAfLlWjeUUWwjlpNKAvOdTY`,
    specs: [],
  },
  {
    slug: 'vanguard-lab',
    name: 'Vanguard-Lab',
    category: 'research',
    badge: '',
    short_description: 'Экспериментальные технологии и прототипы будущего.',
    short_description_en: 'Experimental technology and prototypes of what comes next.',
    full_description: 'Экспериментальные технологии и прототипы будущего.',
    full_description_en: 'Experimental technology and prototypes of what comes next.',
    main_image: `${IMG}AB6AXuCJWeZ_JJT762hk6gyiSHGWsFWvabwJdKtUP_lcCf9aT941MWqjzPbhfXqGx8lFClAsrrPpmY28fqaG0H2EAjh1frowtKwv7bftd8V9Loe6layNvjRHChDL2jp-_natTkb8LP7IPz1B3zLDZR7fR9xfz5dfA5GG0-5VuVVR1Pz7p1FRUNUp-2hIAICV5OrKmNapaclps5XGB8L44vSbqVY4qP_eYoCBYRtHE4tkeuGnuY-3bmg_0Pv9PnxgGPZNbnMV0dwf4zOMHyo`,
    specs: [],
  },
];

const TEXTS = [
  // --- Контакты -------------------------------------------------------------
  { key: 'contacts.title', label: 'Заголовок страницы', value: 'Контакты', type: 'text', group_name: 'contacts' },
  {
    key: 'contacts.intro',
    label: 'Вступительный текст',
    value:
      'Свяжитесь с нами для обсуждения вашего следующего проекта. Наша команда инженеров готова к новым вызовам.',
    type: 'textarea',
    group_name: 'contacts',
  },
  {
    key: 'contacts.address',
    label: 'Адрес',
    value: 'пр. Мәңгілік Ел, 55\nИнновационный центр\nг. Астана, 010000',
    type: 'textarea',
    group_name: 'contacts',
  },
  {
    key: 'contacts.email',
    label: 'Email',
    value: 'info@kae-engineering.ru\nsupport@kae-engineering.ru',
    type: 'textarea',
    group_name: 'contacts',
  },
  {
    key: 'contacts.phone',
    label: 'Телефон',
    value: '+7 (7172) 123-456\nПн-Пт: 09:00 - 18:00',
    type: 'textarea',
    group_name: 'contacts',
  },
  { key: 'contacts.map_title', label: 'Заголовок блока адреса', value: 'Как добраться', type: 'text', group_name: 'contacts' },
  {
    key: 'contacts.map_text',
    label: 'Как добраться — пояснение',
    value:
      'Офис расположен в инновационном кластере столицы. Приём посетителей — по предварительной договорённости, напишите или позвоните, чтобы согласовать время.',
    type: 'textarea',
    group_name: 'contacts',
  },

  // --- О компании -----------------------------------------------------------
  { key: 'about.eyebrow', label: 'Надзаголовок', value: 'Инженерное будущее Казахстана', type: 'text', group_name: 'about' },
  { key: 'about.title', label: 'Заголовок страницы', value: 'О компании', type: 'text', group_name: 'about' },
  {
    key: 'about.intro_1',
    label: 'Первый абзац',
    value:
      'KAE Engineering занимает центральное место в технологической модернизации Казахстана. Наша деятельность охватывает проектирование сложных систем, разработку программно-аппаратных комплексов и интеграцию интеллектуальных решений для индустриального сектора.',
    type: 'textarea',
    group_name: 'about',
  },
  {
    key: 'about.intro_2',
    label: 'Второй абзац',
    value:
      'Будучи резидентом инновационного кластера столицы, мы не просто производим оборудование — мы формируем стандарты инженерии нового поколения. Наша лаборатория в Астане является колыбелью для решений в области автоматизации, систем безопасности и высокоточного приборостроения.',
    type: 'textarea',
    group_name: 'about',
  },
  { key: 'about.stat_1_value', label: 'Показатель 1 — значение', value: '250+', type: 'text', group_name: 'about' },
  { key: 'about.stat_1_label', label: 'Показатель 1 — подпись', value: 'Инженеров высшей категории', type: 'text', group_name: 'about' },
  { key: 'about.stat_2_value', label: 'Показатель 2 — значение', value: '15+', type: 'text', group_name: 'about' },
  { key: 'about.stat_2_label', label: 'Показатель 2 — подпись', value: 'Запатентованных технологий', type: 'text', group_name: 'about' },
  { key: 'about.mission_eyebrow', label: 'Миссия — надзаголовок', value: 'Стратегия', type: 'text', group_name: 'about' },
  { key: 'about.mission_title', label: 'Миссия — заголовок', value: 'Миссия и Видение', type: 'text', group_name: 'about' },
  { key: 'about.mission_1_title', label: 'Миссия 1 — заголовок', value: 'Инновации', type: 'text', group_name: 'about' },
  {
    key: 'about.mission_1_text',
    label: 'Миссия 1 — текст',
    value:
      'Внедрение передовых инженерных решений, которые определяют конкурентоспособность отечественной промышленности на мировом рынке.',
    type: 'textarea',
    group_name: 'about',
  },
  { key: 'about.mission_2_title', label: 'Миссия 2 — заголовок', value: 'Развитие талантов', type: 'text', group_name: 'about' },
  {
    key: 'about.mission_2_text',
    label: 'Миссия 2 — текст',
    value:
      'Создание уникальной среды для роста инженерных кадров Казахстана через трансфер технологий и практический опыт.',
    type: 'textarea',
    group_name: 'about',
  },
  { key: 'about.mission_3_title', label: 'Миссия 3 — заголовок', value: 'Надежность', type: 'text', group_name: 'about' },
  {
    key: 'about.mission_3_text',
    label: 'Миссия 3 — текст',
    value: 'Гарантия безупречного качества и безопасности каждого узла, разработанного в стенах KAE Engineering.',
    type: 'textarea',
    group_name: 'about',
  },
  { key: 'about.team_eyebrow', label: 'Команда — надзаголовок', value: 'Экспертиза', type: 'text', group_name: 'about' },
  { key: 'about.team_title', label: 'Команда — заголовок', value: 'Наша команда', type: 'text', group_name: 'about' },
  {
    key: 'about.team_intro',
    label: 'Команда — текст',
    value:
      'Сообщество профессионалов, вдохновленных идеей создания технологий, которые работают на благо прогресса.',
    type: 'textarea',
    group_name: 'about',
  },
  { key: 'about.cta_title', label: 'Призыв — заголовок', value: 'Готовы к сотрудничеству?', type: 'text', group_name: 'about' },
  {
    key: 'about.cta_text',
    label: 'Призыв — текст',
    value:
      'Присоединяйтесь к числу лидеров индустрии, выбирающих KAE Engineering для реализации самых сложных технологических задач.',
    type: 'textarea',
    group_name: 'about',
  },

  // --- Главная --------------------------------------------------------------
  // До этой группы вся главная была зашита в код, и заполняли её выдуманные
  // показания приборов: «System Status: NOMINAL», «Data Stream: 1.2 GB/S»,
  // «SYS_AUTH: 0x442», полоски «Надёжность — 75%». Последнее читалось не как
  // украшение, а как утверждение: надёжность у нас три четверти.
  //
  // Теперь на главной нет ни одной цифры, которую не ввёл бы владелец сайта.
  // Пустое значение — блок не выводится вовсе, поэтому незаполненное поле
  // выглядит как отсутствие блока, а не как прочерк.
  { key: 'home.hero_eyebrow', label: 'Герой — надзаголовок', value: 'Профессиональная радиосвязь', type: 'text', group_name: 'home' },
  { key: 'home.hero_title_1', label: 'Герой — первая строка заголовка', value: 'Инженерные решения', type: 'text', group_name: 'home' },
  { key: 'home.hero_title_2', label: 'Герой — вторая строка заголовка', value: 'нового поколения', type: 'text', group_name: 'home' },
  {
    key: 'home.hero_text',
    label: 'Герой — описание',
    value:
      'Разрабатываем, производим и поставляем оборудование профессиональной радиосвязи для промышленности и инфраструктуры Казахстана.',
    type: 'textarea',
    group_name: 'home',
  },
  {
    key: 'home.hero_video',
    label: 'Герой — видео: путь /uploads/… из «Медиа» или ссылка. Пусто — без видео',
    // Ссылка на чужой CDN: он в любой момент может её убрать. Загрузите свой
    // ролик в «Медиа» и замените значение — код для этого трогать не нужно.
    value: 'https://cdn.pixabay.com/video/2020/04/23/36979-415518292_large.mp4',
    type: 'text',
    group_name: 'home',
  },
  {
    key: 'home.hero_poster',
    label: 'Герой — кадр-заставка видео (/uploads/…): виден, пока ролик не начался',
    value: '',
    type: 'text',
    group_name: 'home',
  },

  { key: 'home.advantage_1_title', label: 'Преимущество 1 — заголовок', value: 'Надёжность', type: 'text', group_name: 'home' },
  {
    key: 'home.advantage_1_text',
    label: 'Преимущество 1 — текст',
    value: 'Оборудование рассчитано на непрерывную работу в тяжёлых условиях эксплуатации.',
    type: 'textarea',
    group_name: 'home',
  },
  {
    key: 'home.advantage_1_fact',
    label: 'Преимущество 1 — подтверждение (например «−40…+55 °C» или «IP67»)',
    value: '',
    type: 'text',
    group_name: 'home',
  },

  { key: 'home.advantage_2_title', label: 'Преимущество 2 — заголовок', value: 'Собственная разработка', type: 'text', group_name: 'home' },
  {
    key: 'home.advantage_2_text',
    label: 'Преимущество 2 — текст',
    value: 'Схемотехника, прошивка и корпус проектируются внутри компании, а не собираются из готовых модулей.',
    type: 'textarea',
    group_name: 'home',
  },
  {
    key: 'home.advantage_2_fact',
    label: 'Преимущество 2 — подтверждение (например «Диапазон 136–174 МГц»)',
    value: '',
    type: 'text',
    group_name: 'home',
  },

  { key: 'home.advantage_3_title', label: 'Преимущество 3 — заголовок', value: 'Поддержка на месте', type: 'text', group_name: 'home' },
  {
    key: 'home.advantage_3_text',
    label: 'Преимущество 3 — текст',
    value: 'Пусконаладка, обучение персонала и сервис силами инженеров компании в Казахстане.',
    type: 'textarea',
    group_name: 'home',
  },
  {
    key: 'home.advantage_3_fact',
    label: 'Преимущество 3 — подтверждение (например «Гарантия 24 месяца»)',
    value: '',
    type: 'text',
    group_name: 'home',
  },

  // Полоса показателей. Заполните парами «значение + подпись» — пустые пары
  // пропускаются, а если пусты все четыре, полоса не появится совсем.
  { key: 'home.fact_1_value', label: 'Показатель 1 — значение (например «12»)', value: '', type: 'text', group_name: 'home' },
  { key: 'home.fact_1_label', label: 'Показатель 1 — подпись (например «лет на рынке»)', value: '', type: 'text', group_name: 'home' },
  { key: 'home.fact_2_value', label: 'Показатель 2 — значение', value: '', type: 'text', group_name: 'home' },
  { key: 'home.fact_2_label', label: 'Показатель 2 — подпись', value: '', type: 'text', group_name: 'home' },
  { key: 'home.fact_3_value', label: 'Показатель 3 — значение', value: '', type: 'text', group_name: 'home' },
  { key: 'home.fact_3_label', label: 'Показатель 3 — подпись', value: '', type: 'text', group_name: 'home' },
  { key: 'home.fact_4_value', label: 'Показатель 4 — значение', value: '', type: 'text', group_name: 'home' },
  { key: 'home.fact_4_label', label: 'Показатель 4 — подпись', value: '', type: 'text', group_name: 'home' },

  // Заметка рядом с телефоном на первом экране. Телефон и число позиций
  // берутся из контактов и каталога, здесь — свободная третья строка.
  { key: 'home.hero_note', label: 'Герой — короткая заметка рядом с телефоном', value: '', type: 'text', group_name: 'home' },

  // Предметный кадр первого экрана. Нужен снимок с ПРОЗРАЧНЫМ фоном
  // (PNG или WebP с альфа-каналом): предмет лежит поверх подсветки,
  // белая подложка всё сломает.
  {
    key: 'home.hero_product',
    label: 'Герой — предметный кадр на прозрачном фоне (/uploads/…)',
    value: '',
    type: 'text',
    group_name: 'home',
  },
  {
    key: 'home.hero_product_alt',
    label: 'Герой — описание предметного кадра',
    value: '',
    type: 'text',
    group_name: 'home',
  },

  // --- Снимки параллакс-галереи --------------------------------------------
  // Путь вида /uploads/… из раздела «Медиа» либо внешняя ссылка. Пока поле
  // пустое, на месте кадра стоит оформленная заглушка, а не пустота.
  // Подпись (alt) читают поисковики и программы чтения с экрана —
  // опишите, что на снимке, одной фразой.
  {
    key: 'home.feature_image',
    label: 'Галерея — крупный кадр во весь экран (/uploads/…)',
    value: '',
    type: 'text',
    group_name: 'home',
  },
  {
    key: 'home.feature_alt',
    label: 'Галерея — описание крупного кадра',
    value: '',
    type: 'text',
    group_name: 'home',
  },
  { key: 'home.gallery_1_image', label: 'Галерея — кадр 1, вертикальный (/uploads/…)', value: '', type: 'text', group_name: 'home' },
  { key: 'home.gallery_1_alt', label: 'Галерея — описание кадра 1', value: '', type: 'text', group_name: 'home' },
  { key: 'home.gallery_2_image', label: 'Галерея — кадр 2, широкий (/uploads/…)', value: '', type: 'text', group_name: 'home' },
  { key: 'home.gallery_2_alt', label: 'Галерея — описание кадра 2', value: '', type: 'text', group_name: 'home' },
  { key: 'home.gallery_3_image', label: 'Галерея — кадр 3 (/uploads/…)', value: '', type: 'text', group_name: 'home' },
  { key: 'home.gallery_3_alt', label: 'Галерея — описание кадра 3', value: '', type: 'text', group_name: 'home' },

  { key: 'home.systems_title', label: 'Системный инжиниринг — заголовок', value: 'Системный инжиниринг', type: 'text', group_name: 'home' },
  {
    key: 'home.systems_text',
    label: 'Системный инжиниринг — текст',
    value:
      'Проектируем связь как систему целиком: подбор оборудования, расчёт зоны покрытия, монтаж и ввод в эксплуатацию.',
    type: 'textarea',
    group_name: 'home',
  },
];

/**
 * Английские значения тех же ключей.
 *
 * Отдельной картой, а не полем внутри TEXTS: переводы правятся и дополняются
 * пачкой, и держать их рядом друг с другом удобнее, чем выискивать по одному
 * среди русских записей.
 *
 * Ключа здесь может не быть вовсе — так и задумано. Пустой перевод публичный
 * API подменяет русским, поэтому пути к картинкам, адреса почты и числовые
 * показатели переводить не нужно: они одинаковы на обоих языках.
 */
const TEXTS_EN = {
  // --- Контакты -------------------------------------------------------------
  'contacts.title': 'Contacts',
  'contacts.intro':
    'Get in touch to discuss your next project. Our engineering team is ready for a new challenge.',
  'contacts.address': '55 Mangilik El Ave\nInnovation Centre\nAstana 010000, Kazakhstan',
  'contacts.phone': '+7 (7172) 123-456\nMon-Fri: 09:00 - 18:00',
  'contacts.map_title': 'How to find us',
  'contacts.map_text':
    'The office is located in the capital innovation cluster. Visits are by prior arrangement — write or call us to agree on a time.',

  // --- О компании -----------------------------------------------------------
  'about.eyebrow': 'The engineering future of Kazakhstan',
  'about.title': 'About the company',
  'about.intro_1':
    'KAE Engineering sits at the centre of the technological modernisation of Kazakhstan. Our work spans the design of complex systems, the development of hardware and software platforms, and the integration of intelligent solutions for the industrial sector.',
  'about.intro_2':
    'As a resident of the capital innovation cluster, we do more than manufacture equipment — we set the standard for a new generation of engineering. Our laboratory in Astana is where solutions in automation, security systems and high-precision instrumentation are born.',
  'about.stat_1_label': 'Senior-grade engineers',
  'about.stat_2_label': 'Patented technologies',
  'about.mission_eyebrow': 'Strategy',
  'about.mission_title': 'Mission and vision',
  'about.mission_1_title': 'Innovation',
  'about.mission_1_text':
    'Bringing in advanced engineering solutions that make domestic industry competitive on the global market.',
  'about.mission_2_title': 'Growing talent',
  'about.mission_2_text':
    'Building a place where the engineers of Kazakhstan grow, through technology transfer and hands-on practice.',
  'about.mission_3_title': 'Reliability',
  'about.mission_3_text':
    'A guarantee of flawless quality and safety for every unit designed inside KAE Engineering.',
  'about.team_eyebrow': 'Expertise',
  'about.team_title': 'Our team',
  'about.team_intro':
    'A community of professionals driven by the idea of building technology that serves progress.',
  'about.cta_title': 'Ready to work together?',
  'about.cta_text':
    'Join the industry leaders who choose KAE Engineering for their most demanding technological challenges.',

  // --- Главная --------------------------------------------------------------
  'home.hero_eyebrow': 'Professional radio communications',
  'home.hero_title_1': 'Engineering solutions',
  'home.hero_title_2': 'of a new generation',
  'home.hero_text':
    'We design, manufacture and supply professional radio communication equipment for the industry and infrastructure of Kazakhstan.',
  'home.advantage_1_title': 'Reliability',
  'home.advantage_1_text': 'The equipment is built for continuous operation in harsh conditions.',
  'home.advantage_2_title': 'Engineered in-house',
  'home.advantage_2_text':
    'Circuitry, firmware and enclosure are designed within the company rather than assembled from off-the-shelf modules.',
  'home.advantage_3_title': 'Support on site',
  'home.advantage_3_text':
    'Commissioning, staff training and servicing by the company engineers, in Kazakhstan.',
  'home.systems_title': 'Systems engineering',
  'home.systems_text':
    'We design communications as a whole system: equipment selection, coverage planning, installation and commissioning.',
};

const TEAM = [
  {
    name: 'Арман Искаков',
    name_en: 'Arman Iskakov',
    position: 'Главный архитектор систем',
    position_en: 'Chief systems architect',
    tags: 'Senior Eng,PhD',
    photo: `${IMG}AB6AXuBB18ZXo0sXjVg4sqToVZtIa-MVgF0GJWHkiJ-OBNFl4ZUd3iIA_2cSoMjeIqoMt79rqwUbX7upADsA5-nYXMNZPYfITMgKWNqisRtRoMw1LcZknqi8zJwuQVWxE-EEWZMGAkEff1nih0UsbfhcwujWgymusu99UCcv7ZYNXSGBgEgrzSzRCArREwd0-NMWW7OKl-X44s1g4O3c7ZQwrVakavHro6m1l2MV3Fr8xSoSdWlJLaihv90gstG4pIhhb2QuXW21aXDvm38`,
  },
  {
    name: 'Динара Султан',
    name_en: 'Dinara Sultan',
    position: 'Руководитель отдела робототехники',
    position_en: 'Head of robotics',
    tags: 'Robotics,Lead',
    photo: `${IMG}AB6AXuC3TG56giZZ_NQVACNerzwPObmT_BELn8nrIUupBDy0z1A80R7inLQbLepei34CscJ3vMJQPOaUvzWatzz3Yr5ShIp1eukvKi7W9DuVw_tyO9YELbWsNePyTclmOzfTfDM0ARqHxTga6741gOd4CvSfKB0u_U5oamlk6zAgAaXBLHCWZnB6w2A6p8Ai5ZO047dloPAjXFpXNAa39Ou-7CrSkB7BHPTMAzfwHzPI3-5g1w1lbQJhy35dJQQaGO7dzLHFK2Zs35N4Vrg`,
  },
  {
    name: 'Виктор Пак',
    name_en: 'Viktor Pak',
    position: 'Ведущий разработчик плат',
    position_en: 'Lead board designer',
    tags: 'Hardware,Dev',
    photo: `${IMG}AB6AXuCObsC_IXwroikR-Dwhl-E2tIHHC1v5fOZgCNTA4zRx0RLoC18T8CAufGPyB118c13cqOx9s4mtP3KkbFR6Prcoc0iHmFHzScFJxypKYV8yOtICqov9xTMOYC4eGfegm5h62sG-Tql_57AxstOa1oqaXdnUS9HDv_mppfV8D_-NYsCmje9EpnFjmF9c4VwZZ-_RUHIdenp34YXskYYRm2_qu_sPqP4Xf1YQM_zo1i_blAcXDV5UmjsU3kHUJccQ-YHQTtbcwLu1oss`,
  },
  {
    name: 'Данияр Омаров',
    name_en: 'Daniyar Omarov',
    position: 'Директор по операциям',
    position_en: 'Director of operations',
    tags: 'Ops,Director',
    photo: `${IMG}AB6AXuDQBLO-UTZA2w2nzTIxGmgEVOKb19P_aGDx89hJeRm2sRk9AuYLoDxZfuRLqQohK5snyQpFQu8zCBAcN60-JQK97GBmN93wE2qgouPh1oUU1GxXCLRoBgPjEItHDS4Y-h5K9nHLgBG_6IjDphTkFnxnD0207My11p7Ccxk24ZrY-f5C3DxDr1mwuZ_G5btY4l8ZzMz3fV0YZO4yFVmLTuQjJApFU904t7vRnQS_aGM0QPX40dXtvVCl7Xav2uZFyl5m5J2VpgQ_7IY`,
  },
];

// ---------------------------------------------------------------------------
// Заливка
// ---------------------------------------------------------------------------

const db = getDb();

if (RESET) {
  // Порядок важен: сначала зависимые таблицы. Пользователей не трогаем.
  for (const table of [
    'analytics_events',
    'requests',
    'documents',
    'product_applications',
    'product_images',
    'product_specs',
    'products',
    'categories',
    'team_members',
    'texts',
  ]) {
    db.exec(`DELETE FROM ${table}`);
  }
  db.exec("DELETE FROM sqlite_sequence WHERE name NOT IN ('users')");
  console.log('Контентные таблицы очищены.');
}

const categoryIds = new Map();

// Русское название обновляется всегда, английское — только пока оно пусто:
// колонка появилась позже, и заполнить её из сида можно, а затирать
// введённый в админке перевод — нельзя.
const insertCategory = db.prepare(`
  INSERT INTO categories (name, name_en, slug, sort)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(slug) DO UPDATE SET
    name    = excluded.name,
    name_en = CASE WHEN categories.name_en = '' THEN excluded.name_en ELSE categories.name_en END
  RETURNING id
`);

CATEGORIES.forEach((category, index) => {
  const { id } = insertCategory.get(category.name, category.name_en, category.slug, index);
  categoryIds.set(category.slug, id);
});

const insertProduct = db.prepare(`
  INSERT INTO products
    (name, slug, category_id, short_description, short_description_en,
     full_description, full_description_en, main_image, badge, status, sort)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)
  ON CONFLICT(slug) DO NOTHING
  RETURNING id
`);

const insertSpec = db.prepare(
  'INSERT INTO product_specs (product_id, spec_group, name, value, is_key, sort) VALUES (?, ?, ?, ?, ?, ?)',
);

let created = 0;

PRODUCTS.forEach((product, index) => {
  const row = insertProduct.get(
    product.name,
    product.slug,
    categoryIds.get(product.category),
    product.short_description,
    product.short_description_en,
    product.full_description,
    product.full_description_en,
    product.main_image,
    product.badge,
    index,
  );

  // ON CONFLICT DO NOTHING — товар уже был, характеристики не дублируем.
  if (!row) return;

  created += 1;
  product.specs.forEach((spec, specIndex) => {
    insertSpec.run(row.id, spec.group, spec.name, spec.value, spec.is_key, specIndex);
  });
});

// Значения не перезаписываются: их правит владелец сайта, и повторная
// заливка не должна возвращать заводской текст. Исключение — пустой перевод:
// колонка value_en появилась позже и у существующих записей пуста, так что
// заполнить её из сида можно без риска затереть чужую работу.
const insertText = db.prepare(`
  INSERT INTO texts (key, label, value, value_en, type, group_name, sort)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET
    label      = excluded.label,
    type       = excluded.type,
    group_name = excluded.group_name,
    sort       = excluded.sort,
    value_en   = CASE WHEN texts.value_en = '' THEN excluded.value_en ELSE texts.value_en END
`);

TEXTS.forEach((text, index) => {
  insertText.run(text.key, text.label, text.value, TEXTS_EN[text.key] ?? '', text.type, text.group_name, index);
});

if (db.prepare('SELECT COUNT(*) AS count FROM team_members').get().count === 0) {
  const insertMember = db.prepare(
    'INSERT INTO team_members (name, name_en, position, position_en, photo, tags, sort) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  TEAM.forEach((member, index) => {
    insertMember.run(member.name, member.name_en, member.position, member.position_en, member.photo, member.tags, index);
  });
}

// --- Учётная запись администратора ------------------------------------------
if (db.prepare('SELECT COUNT(*) AS count FROM users').get().count === 0) {
  const email = process.env.ADMIN_EMAIL || 'admin@kae-engineering.kz';
  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD || randomBytes(9).toString('base64url');

  db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    email,
    bcrypt.hashSync(password, 12),
    'Администратор',
    'admin',
  );

  console.log(`\nСоздан администратор: ${email}`);
  if (generated) {
    console.log(`Пароль: ${password}`);
    console.log('Сохраните его — повторно он не покажется.\n');
  }
}

const counts = {
  категории: db.prepare('SELECT COUNT(*) AS count FROM categories').get().count,
  товары: db.prepare('SELECT COUNT(*) AS count FROM products').get().count,
  характеристики: db.prepare('SELECT COUNT(*) AS count FROM product_specs').get().count,
  тексты: db.prepare('SELECT COUNT(*) AS count FROM texts').get().count,
  команда: db.prepare('SELECT COUNT(*) AS count FROM team_members').get().count,
  пользователи: db.prepare('SELECT COUNT(*) AS count FROM users').get().count,
};

console.log(`БД: ${DB_PATH}`);
console.log(`Новых товаров за этот запуск: ${created}`);
console.table(counts);

closeDb();
