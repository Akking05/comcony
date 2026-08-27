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
  { slug: 'drones', name: 'Беспилотные системы' },
  { slug: 'electronics', name: 'Электронное оборудование' },
  { slug: 'engineering-systems', name: 'Инженерные комплексы' },
  { slug: 'surveillance', name: 'Системы наблюдения' },
  { slug: 'automation', name: 'Промышленная автоматика' },
  { slug: 'research', name: 'Перспективные разработки' },
];

const IMG = 'https://lh3.googleusercontent.com/aida-public/';

const PRODUCTS = [
  {
    slug: 'series-x',
    name: 'Series-X',
    category: 'drones',
    badge: 'SYSTEM ACTIVE',
    short_description: 'Автономные решения для разведки и логистики.',
    full_description:
      'Автономные решения для разведки и логистики. Designed for high-intensity reconnaissance and rapid deployment. The Series-X represents the pinnacle of autonomous flight research, engineered for complex industrial and tactical applications.',
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
    full_description: 'Высокоточная электроника для критически важных систем.',
    main_image: `${IMG}AB6AXuAS_63Kua_g7zgZvD35_9I8lrQKbPZnLCZYBjuaTCTh90zpFgZLVmcrhr7HF7Y0jyLEZI7RtWo1aNgV9joWFU3oT6_ygo5I_d-tZQ0cBm7Rf3Coi01NBbg_8E2Og1zIMPUbkQD8BMJql9-YUYXRPWTMj6gPgExPDhZTmoXXELKke8_z6uUq-gn4eSoOyJkt1sSEfzeCmq7mPOpkDxPlTnG8kuSo3O3bEwbPalWkVFlD2zz5QLCwWaz479Dnbtvl2jFIsEe4LlVM_rY`,
    specs: [],
  },
  {
    slug: 'modular-x',
    name: 'Modular-X',
    category: 'engineering-systems',
    badge: '',
    short_description: 'Масштабные модульные системы для индустрии.',
    full_description: 'Масштабные модульные системы для индустрии.',
    main_image: `${IMG}AB6AXuB1Nm2DU0btOBWgFXfjwTDYEVrkQbR3dWj5uUzRj8k7mnYN_Ezs1y86aCCAGFS2lb9R3OpkMFbMGkIJzQxjAi9m2Zn9QgSnvR1cpecJCDMIcKO4xNwabX97SDbyv7S02k0nb_cZgqJsHg4EkpwRvxYicc-RMHxqGG9lO-NRkonqcXXIcz3UdtdwCZx1Q92cFRSpHAhicbvnQfnSwu6LFs-CKIBSUilk3S9qzizG_aKQTDews41T8kRXwU3Olff86w1buk_YTFCWGGU`,
    specs: [],
  },
  {
    slug: 'aegis-vision',
    name: 'Aegis-Vision',
    category: 'surveillance',
    badge: '',
    short_description: 'Интеллектуальный мониторинг и безопасность.',
    full_description: 'Интеллектуальный мониторинг и безопасность.',
    main_image: `${IMG}AB6AXuBjySDmA2EvBqieaEux147dq7-vuU6mh5mrUtT18XMdVSZjvDbbxnxbxPXqC5FmfbICOIN_VK_9MW4155xrTKNFbxbFgCFJQj7CPprBIGmm0JkD4EFuYC7W4zyMJcTM0QXwkB_cJaSN3jR6wglAWugxpLFscTevra_7aIlEgHWtxbdlpn-iXimMnYAcPk0AYHAe0iiaWWIq60KPRfA1LNWGjrLIrRVtl3GxP3_m1W4jwq3H7uKfg0-oC84wyjSLm73nVCoU6xozJpI`,
    specs: [],
  },
  {
    slug: 'forge-os',
    name: 'Forge-OS',
    category: 'automation',
    badge: '',
    short_description: 'Роботизированные линии нового поколения.',
    full_description: 'Роботизированные линии нового поколения.',
    main_image: `${IMG}AB6AXuAP63A1T4qtx1dKk2aLoNzU85FmF6yvzA8pqWIZ-HzPyrqRWMiqgyejyBdo26w_oTN1HPcScMtVmCbl-nh1Vu8fgIQEmnu-IzV_Z235UcjY4ofxgPMGnoF-ZlmdDphK3PIfDzIvyIvLmu3NHrtgcTkGVslCzTJPcBlggfV8xuzSQCznjV3FOheKUpQGiUueIIdu_47iWfVe7D0ppJ6I-mJ1AvYNyQPNxQTW-KwI9RDlzIMGI87QM6i7tAfLlWjeUUWwjlpNKAvOdTY`,
    specs: [],
  },
  {
    slug: 'vanguard-lab',
    name: 'Vanguard-Lab',
    category: 'research',
    badge: '',
    short_description: 'Экспериментальные технологии и прототипы будущего.',
    full_description: 'Экспериментальные технологии и прототипы будущего.',
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
  { key: 'contacts.map_title', label: 'Заголовок блока карты', value: 'Интерактивная карта', type: 'text', group_name: 'contacts' },
  {
    key: 'contacts.map_text',
    label: 'Текст блока карты',
    value:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut vulputate arcu. Donec sit amet accumsan est, ut imperdiet nunc. Vivamus varius ex ac dolor ultrices euismod. Suspendisse pulvinar nisi eget erat bibendum. Fusce lacinia id dolor congue ullamcorper. Pellentesque varius augue purus, quis congue mi porta a.',
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
];

const TEAM = [
  {
    name: 'Арман Искаков',
    position: 'Главный архитектор систем',
    tags: 'Senior Eng,PhD',
    photo: `${IMG}AB6AXuBB18ZXo0sXjVg4sqToVZtIa-MVgF0GJWHkiJ-OBNFl4ZUd3iIA_2cSoMjeIqoMt79rqwUbX7upADsA5-nYXMNZPYfITMgKWNqisRtRoMw1LcZknqi8zJwuQVWxE-EEWZMGAkEff1nih0UsbfhcwujWgymusu99UCcv7ZYNXSGBgEgrzSzRCArREwd0-NMWW7OKl-X44s1g4O3c7ZQwrVakavHro6m1l2MV3Fr8xSoSdWlJLaihv90gstG4pIhhb2QuXW21aXDvm38`,
  },
  {
    name: 'Динара Султан',
    position: 'Руководитель отдела робототехники',
    tags: 'Robotics,Lead',
    photo: `${IMG}AB6AXuC3TG56giZZ_NQVACNerzwPObmT_BELn8nrIUupBDy0z1A80R7inLQbLepei34CscJ3vMJQPOaUvzWatzz3Yr5ShIp1eukvKi7W9DuVw_tyO9YELbWsNePyTclmOzfTfDM0ARqHxTga6741gOd4CvSfKB0u_U5oamlk6zAgAaXBLHCWZnB6w2A6p8Ai5ZO047dloPAjXFpXNAa39Ou-7CrSkB7BHPTMAzfwHzPI3-5g1w1lbQJhy35dJQQaGO7dzLHFK2Zs35N4Vrg`,
  },
  {
    name: 'Виктор Пак',
    position: 'Ведущий разработчик плат',
    tags: 'Hardware,Dev',
    photo: `${IMG}AB6AXuCObsC_IXwroikR-Dwhl-E2tIHHC1v5fOZgCNTA4zRx0RLoC18T8CAufGPyB118c13cqOx9s4mtP3KkbFR6Prcoc0iHmFHzScFJxypKYV8yOtICqov9xTMOYC4eGfegm5h62sG-Tql_57AxstOa1oqaXdnUS9HDv_mppfV8D_-NYsCmje9EpnFjmF9c4VwZZ-_RUHIdenp34YXskYYRm2_qu_sPqP4Xf1YQM_zo1i_blAcXDV5UmjsU3kHUJccQ-YHQTtbcwLu1oss`,
  },
  {
    name: 'Данияр Омаров',
    position: 'Директор по операциям',
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

const insertCategory = db.prepare(
  'INSERT INTO categories (name, slug, sort) VALUES (?, ?, ?) ON CONFLICT(slug) DO UPDATE SET name = excluded.name RETURNING id',
);

CATEGORIES.forEach((category, index) => {
  const { id } = insertCategory.get(category.name, category.slug, index);
  categoryIds.set(category.slug, id);
});

const insertProduct = db.prepare(`
  INSERT INTO products
    (name, slug, category_id, short_description, full_description, main_image, badge, status, sort)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?)
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
    product.full_description,
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

const insertText = db.prepare(`
  INSERT INTO texts (key, label, value, type, group_name, sort)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET label = excluded.label, type = excluded.type, group_name = excluded.group_name, sort = excluded.sort
`);

TEXTS.forEach((text, index) => {
  insertText.run(text.key, text.label, text.value, text.type, text.group_name, index);
});

if (db.prepare('SELECT COUNT(*) AS count FROM team_members').get().count === 0) {
  const insertMember = db.prepare(
    'INSERT INTO team_members (name, position, photo, tags, sort) VALUES (?, ?, ?, ?, ?)',
  );
  TEAM.forEach((member, index) => {
    insertMember.run(member.name, member.position, member.photo, member.tags, index);
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
