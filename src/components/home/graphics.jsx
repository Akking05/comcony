/*
  Вся графика главной нарисована здесь руками. Ни одного растрового файла,
  ни одной внешней иконки: детали рации, пиктограммы обращения груза, клейма
  направлений и отметки маршрута — это пути в одном штрихе.

  Каждая фигура нарисована в собственных координатах с центром в нуле, чтобы
  её можно было поставить трансформом куда угодно и в любом масштабе. Цвет
  приходит токенами мира, а не задаётся здесь.
*/

const LINE = 'var(--color-stencil)';
const DIM = 'var(--color-stencil-dim)';
const FILL = 'var(--color-part-fill)';

/** Трафаретный штрих с мостиками: краска не ложится сплошной линией. */
const BRIDGED = '54 6 26 6';

/* ---------------------------------------------------------------- */
/* Шесть частей носимой радиостанции                                  */
/* ---------------------------------------------------------------- */

function Antenna({ strokeWidth = 2 }) {
  return (
    <g fill="none" stroke={LINE} strokeWidth={strokeWidth}>
      <path d="M-6 -150 L6 -150 L9 88 L-9 88 Z" fill={FILL} strokeDasharray={BRIDGED} />
      <path d="M-4 -140 L4 -140" stroke={DIM} />
      <path d="M-13 88 L13 88 L13 124 L-13 124 Z" fill={FILL} />
      <path d="M-13 98 H13 M-13 108 H13 M-13 118 H13" stroke={DIM} strokeWidth={1} />
      <path d="M-9 124 L9 124 L9 150 L-9 150 Z" fill={FILL} />
      <path d="M-9 131 H9 M-9 138 H9 M-9 145 H9" stroke={DIM} strokeWidth={1} />
    </g>
  );
}

function Body({ strokeWidth = 2 }) {
  const keys = [];

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      keys.push(
        <rect key={`${row}-${col}`} x={-52 + col * 36} y={-24 + row * 30} width={28} height={22} />,
      );
    }
  }

  return (
    <g fill="none" stroke={LINE} strokeWidth={strokeWidth}>
      <rect x={-95} y={-155} width={190} height={310} fill={FILL} strokeDasharray={BRIDGED} />
      <rect x={-84} y={-144} width={168} height={288} stroke={DIM} strokeWidth={1} />
      <rect x={-62} y={-132} width={124} height={62} fill="none" />
      <path d="M-52 -116 H52 M-52 -102 H30 M-52 -88 H44" stroke={DIM} strokeWidth={1} />
      <circle cx={-64} cy={-48} r={11} />
      <circle cx={64} cy={-48} r={11} />
      <path d="M-64 -59 V-37 M53 -48 H75" stroke={DIM} strokeWidth={1} />
      <g stroke={DIM} strokeWidth={1}>
        {keys}
      </g>
      <rect x={-40} y={118} width={80} height={22} />
      <path d="M-95 -20 h-10 M-95 4 h-10 M-95 28 h-10" stroke={DIM} strokeWidth={1} />
    </g>
  );
}

function Speaker({ strokeWidth = 2 }) {
  const slots = [];

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      slots.push(
        <rect key={`${row}-${col}`} x={-72 + col * 19} y={-38 + row * 20} width={12} height={11} />,
      );
    }
  }

  return (
    <g fill="none" stroke={LINE} strokeWidth={strokeWidth}>
      <rect x={-95} y={-65} width={190} height={130} fill={FILL} strokeDasharray={BRIDGED} />
      <g stroke={DIM} strokeWidth={1}>
        {slots}
      </g>
      <circle cx={-80} cy={-50} r={4} stroke={DIM} strokeWidth={1} />
      <circle cx={80} cy={-50} r={4} stroke={DIM} strokeWidth={1} />
      <circle cx={-80} cy={50} r={4} stroke={DIM} strokeWidth={1} />
      <circle cx={80} cy={50} r={4} stroke={DIM} strokeWidth={1} />
    </g>
  );
}

function Battery({ strokeWidth = 2 }) {
  const hatch = [];

  for (let i = 0; i < 6; i += 1) {
    hatch.push(<path key={i} d={`M${-72 + i * 26} 40 L${-52 + i * 26} 8`} />);
  }

  return (
    <g fill="none" stroke={LINE} strokeWidth={strokeWidth}>
      <rect x={-100} y={-65} width={200} height={130} fill={FILL} strokeDasharray={BRIDGED} />
      <rect x={-86} y={-51} width={140} height={44} stroke={DIM} strokeWidth={1} />
      <g stroke={DIM} strokeWidth={1}>
        {hatch}
      </g>
      <rect x={70} y={-46} width={16} height={16} />
      <rect x={70} y={-16} width={16} height={16} />
      <path d="M-24 -65 L-14 -75 L14 -75 L24 -65" />
    </g>
  );
}

function Ptt({ strokeWidth = 2 }) {
  return (
    <g fill="none" stroke={LINE} strokeWidth={strokeWidth}>
      <rect x={-40} y={-90} width={80} height={118} fill={FILL} strokeDasharray="40 6" />
      <rect x={-26} y={-72} width={52} height={34} />
      <path d="M-18 -22 h36 M-18 -8 h36 M-18 6 h36" stroke={DIM} strokeWidth={1} />
      <rect x={-12} y={28} width={24} height={16} fill={FILL} />
      <path d="M0 44 C0 66 26 70 52 88" strokeDasharray="12 5" />
      <path d="M52 88 l10 4" />
    </g>
  );
}

function Clip({ strokeWidth = 2 }) {
  return (
    <g fill="none" stroke={LINE} strokeWidth={strokeWidth}>
      <rect x={-80} y={-52} width={124} height={38} fill={FILL} strokeDasharray="42 6" />
      <path d="M-80 -14 L58 -14 L78 8 L44 46 L-64 46" fill="none" />
      <circle cx={-58} cy={-33} r={6} stroke={DIM} strokeWidth={1} />
      <circle cx={22} cy={-33} r={6} stroke={DIM} strokeWidth={1} />
      <path d="M-40 -14 v60 M-10 -14 v60 M20 -14 v58" stroke={DIM} strokeWidth={1} />
    </g>
  );
}

const PART_SHAPES = {
  antenna: Antenna,
  body: Body,
  battery: Battery,
  speaker: Speaker,
  ptt: Ptt,
  clip: Clip,
};

export function RadioPartShape({ id, strokeWidth }) {
  const Shape = PART_SHAPES[id];

  return Shape ? <Shape strokeWidth={strokeWidth} /> : null;
}

/* ---------------------------------------------------------------- */
/* Пиктограммы обращения с грузом                                     */
/* ---------------------------------------------------------------- */

/** Хрупкое. */
function FragileMark() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <path d="M-14 -30 L14 -30 L9 -6 L4 0 L4 22 L14 22 L14 30 L-14 30 L-14 22 L-4 22 L-4 0 L-9 -6 Z" />
      <path d="M-9 -30 L-2 -14 L-11 -10 L-4 4" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

/** Верх. */
function ThisWayUpMark() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <path d="M-11 -6 L-11 30 M-11 -30 L-19 -14 M-11 -30 L-3 -14" />
      <path d="M11 -6 L11 30 M11 -30 L3 -14 M11 -30 L19 -14" />
      <path d="M-22 -30 H22" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

/** Беречь от влаги. */
function KeepDryMark() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <path d="M-22 -2 A22 22 0 0 1 22 -2 Z" />
      <path d="M0 -24 V-2 M0 -2 V22 A8 8 0 0 0 16 22" />
      <path d="M-18 12 l0 8 M-8 18 l0 8 M12 6 l0 8" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

/** Знаки обращения с грузом в порядке, в котором их бьют по борту. */
export const HANDLING_MARKS = [
  { id: 'fragile', labelKey: 'home.handling_fragile', Mark: FragileMark },
  { id: 'up', labelKey: 'home.handling_up', Mark: ThisWayUpMark },
  { id: 'dry', labelKey: 'home.handling_dry', Mark: KeepDryMark },
];

/* ---------------------------------------------------------------- */
/* Клейма направлений                                                 */
/* ---------------------------------------------------------------- */

function RadioGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <rect x={-14} y={-6} width={28} height={40} />
      <path d="M-6 4 h12 M-6 14 h12 M-6 24 h12" stroke={DIM} strokeWidth={1.5} />
      <path d="M6 -6 V-30" />
      <path d="M14 -30 A16 16 0 0 1 24 -18" />
      <path d="M18 -38 A26 26 0 0 1 34 -18" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

function RepeaterGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <path d="M-16 34 L0 -26 L16 34" />
      <path d="M-11 12 H11 M-7 -4 H7" stroke={DIM} strokeWidth={1.5} />
      <path d="M-24 -22 A30 30 0 0 0 -24 6" />
      <path d="M24 -22 A30 30 0 0 1 24 6" />
      <circle cx={0} cy={-30} r={3} />
    </g>
  );
}

/** Мобильная станция: приборная панель с выносной антенной. */
function MobileStationGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <rect x={-30} y={-2} width={60} height={30} />
      <path d="M-20 8 h18 M-20 18 h12" stroke={DIM} strokeWidth={1.5} />
      <circle cx={18} cy={13} r={7} />
      <path d="M-30 28 h60" stroke={DIM} strokeWidth={1.5} />
      <path d="M22 -2 V-34" />
      <path d="M14 -34 h16" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

function BaseStationGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <rect x={-26} y={-8} width={52} height={40} />
      <path d="M-16 2 h32 M-16 12 h32 M-16 22 h20" stroke={DIM} strokeWidth={1.5} />
      <path d="M-18 -8 V-30 H18 V-8" />
      <path d="M0 -30 V-40" />
    </g>
  );
}

function ScopeGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <circle cx={0} cy={4} r={22} />
      <path d="M-30 4 H-22 M22 4 H30 M0 -18 V-26 M0 26 V34" />
      <path d="M-14 4 H14 M0 -10 V18" stroke={DIM} strokeWidth={1.5} />
      <rect x={-7} y={-32} width={14} height={8} />
    </g>
  );
}

function BinocularsGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <rect x={-26} y={-22} width={20} height={44} />
      <rect x={6} y={-22} width={20} height={44} />
      <path d="M-6 -12 h12 M-6 6 h12" />
      <path d="M-22 -30 h12 M10 -30 h12" />
      <path d="M-21 12 h10 M11 12 h10" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

function NightVisionGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <path d="M-28 -14 H28 V10 H10 L2 22 H-2 L-10 10 H-28 Z" />
      <circle cx={-15} cy={-2} r={7} />
      <circle cx={15} cy={-2} r={7} />
      <path d="M-28 -14 V-26 H-6 M28 -14 V-26 H6" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

function BoardGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <rect x={-22} y={-22} width={44} height={44} />
      <rect x={-9} y={-9} width={18} height={18} stroke={DIM} strokeWidth={1.5} />
      <path d="M-22 -12 h-10 M-22 0 h-10 M-22 12 h-10 M22 -12 h10 M22 0 h10 M22 12 h10" />
      <path d="M-12 -22 v-10 M0 -22 v-10 M12 -22 v-10" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

function ModuleGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <rect x={-30} y={-26} width={60} height={18} />
      <rect x={-30} y={-4} width={60} height={18} />
      <rect x={-30} y={18} width={60} height={14} stroke={DIM} strokeWidth={1.5} />
      <path d="M-20 -22 h8 M-20 0 h8" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

function AutomationGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <path d="M-26 30 H26" />
      <path d="M-14 30 V6 L10 -14" />
      <path d="M10 -14 L28 -24" strokeDasharray="8 5" />
      <circle cx={-14} cy={6} r={5} />
      <circle cx={10} cy={-14} r={5} />
      <path d="M-24 30 v-6 h20 v6" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

function DroneGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <rect x={-12} y={-8} width={24} height={16} />
      <path d="M-12 -8 L-26 -22 M12 -8 L26 -22 M-12 8 L-26 22 M12 8 L26 22" />
      <path d="M-34 -22 h16 M18 -22 h16 M-34 22 h16 M18 22 h16" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

function PrototypeGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <path d="M-24 -12 L0 -26 L24 -12 V16 L0 30 L-24 16 Z" />
      <path d="M-24 -12 L0 2 L24 -12 M0 2 V30" stroke={DIM} strokeWidth={1.5} strokeDasharray="7 5" />
    </g>
  );
}

/** Клеймо по умолчанию: ящик с обвязкой. Незнакомая категория не остаётся пустой. */
function CrateGlyph() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <rect x={-28} y={-22} width={56} height={44} />
      <path d="M-28 -10 H28 M-28 10 H28" stroke={DIM} strokeWidth={1.5} />
      <path d="M-12 -22 V22 M12 -22 V22" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

/*
  Клеймо выбирается по слагу категории из базы: категории заводит владелец
  сайта, и новая категория обязана получить знак, а не дырку. Незнакомый слаг
  берёт ящик.
*/
const DIRECTION_GLYPHS = {
  'mobile-stations': MobileStationGlyph,
  'portable-stations': RadioGlyph,
  'base-stations': BaseStationGlyph,
  repeaters: RepeaterGlyph,
  surveillance: ScopeGlyph,
  binoculars: BinocularsGlyph,
  nightvision: NightVisionGlyph,
  optics: BinocularsGlyph,
  electronics: BoardGlyph,
  'engineering-systems': ModuleGlyph,
  automation: AutomationGlyph,
  drones: DroneGlyph,
  research: PrototypeGlyph,
};

export function DirectionGlyph({ slug }) {
  const Glyph = DIRECTION_GLYPHS[slug] ?? CrateGlyph;

  return <Glyph />;
}

/* ---------------------------------------------------------------- */
/* Отметки маршрута груза                                             */
/* ---------------------------------------------------------------- */

function DesignMark() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <path d="M-16 14 L0 -16 L16 14 Z" />
      <path d="M-9 2 H9" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

function InstallMark() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <path d="M-12 -14 H12 V-4 H4 V16 H-4 V-4 H-12 Z" />
      <path d="M-16 16 H16" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

function CommissioningMark() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <circle cx={0} cy={1} r={14} />
      <path d="M0 -13 V1 L10 9" />
    </g>
  );
}

function TrainingMark() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <rect x={-16} y={-12} width={32} height={26} />
      <path d="M0 -12 V14" />
      <path d="M-11 -5 h7 M-11 3 h7 M4 -5 h7 M4 3 h7" stroke={DIM} strokeWidth={1.5} />
    </g>
  );
}

function ServiceMark() {
  return (
    <g fill="none" stroke={LINE} strokeWidth={2}>
      <path d="M8 -16 A11 11 0 1 0 -6 -2 L-14 6 L-6 14 L2 6 A11 11 0 0 0 16 -8 L8 0 L0 -8 Z" />
    </g>
  );
}

const SUPPLY_MARKS = {
  design: DesignMark,
  install: InstallMark,
  commissioning: CommissioningMark,
  training: TrainingMark,
  service: ServiceMark,
};

export function SupplyMark({ id }) {
  const Mark = SUPPLY_MARKS[id];

  return Mark ? <Mark /> : null;
}

/* ---------------------------------------------------------------- */
/* Разобранный узел крепления: пять элементов на одной оси             */
/* ---------------------------------------------------------------- */

const NODE_SHAPES = [
  <g key="0" fill="none">
    <path d="M-34 -78 H34 V78 H-34 Z" />
    <path d="M-18 -58 H18 M-18 58 H18" />
    <circle cx={0} cy={0} r={16} />
  </g>,
  <g key="1" fill="none">
    <circle cx={0} cy={0} r={46} />
    <circle cx={0} cy={0} r={22} />
    <path d="M-46 0 H-58 M46 0 H58" />
  </g>,
  <g key="2" fill="none">
    <path d="M-30 -54 H30 L44 0 L30 54 H-30 L-44 0 Z" />
    <path d="M-14 0 H14" />
  </g>,
  <g key="3" fill="none">
    <path d="M-26 -34 H26 V34 H-26 Z" />
    <path d="M-26 -12 H26 M-26 12 H26" />
  </g>,
  <g key="4" fill="none">
    <path d="M-16 -62 H16 V62 H-16 Z" />
    <path d="M0 -62 V62" />
  </g>,
];

export function NodeShape({ index }) {
  return NODE_SHAPES[index] ?? null;
}

export const NODE_COUNT = NODE_SHAPES.length;
