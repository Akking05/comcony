/*
  Геометрия первого экрана.

  Раскладка подчиняется разобранному объекту, а не колонкам: карманы
  ложемента стоят там, где деталь лежит в ящике, а выноска уходит в
  ближайший свободный воздух. Поэтому числа заданы поимённо, а не выведены
  из сетки, — сетки здесь нет вовсе.

  Каждая деталь нарисована в собственных координатах с центром в нуле и
  ставится трансформом. Конечное состояние (`t = 1`) — деталь в своём
  кармане в натуральную величину; исходное (`t = 0`) — та же деталь в
  собранной рации внутри закрытого кофра. Без движения отрисовывается
  конечное.
*/

/**
 * Смещение центра детали относительно центра собранной рации, в собственных
 * единицах деталей. Отсюда же читается порядок сборки: антенна сверху,
 * аккумулятор снизу, тангента слева, клипса сзади справа.
 */
export const PACKED_OFFSET = {
  antenna: { x: -55, y: -300 },
  body: { x: 0, y: 0 },
  speaker: { x: 0, y: -85 },
  battery: { x: 0, y: 210 },
  ptt: { x: -150, y: 40 },
  clip: { x: 135, y: 120 },
};

export const center = (box) => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });

/** Абсолютный центр детали в собранном состоянии. */
export function packedPoint(layout, id) {
  const offset = PACKED_OFFSET[id];

  return {
    x: layout.packedCenter.x + offset.x * layout.packedScale,
    y: layout.packedCenter.y + offset.y * layout.packedScale,
  };
}

export const WIDE_LAYOUT = {
  width: 1440,
  height: 820,
  shell: { x: 480, y: 120, w: 920, h: 640 },
  bed: { x: 506, y: 146, w: 868, h: 534 },
  band: { x: 506, y: 680, w: 868, h: 80 },
  openScale: 1,
  packedScale: 0.62,
  packedCenter: { x: 940, y: 467 },
  nameSize: 15,
  roleSize: 12,
  slots: [
    {
      id: 'antenna',
      pocket: { x: 534, y: 166, w: 30, h: 300 },
      callout: { anchor: { x: 564, y: 220 }, elbow: { x: 610, y: 190 }, shelf: { x: 760, y: 190 }, align: 'start' },
    },
    {
      id: 'body',
      pocket: { x: 700, y: 230, w: 190, h: 300 },
      callout: { anchor: { x: 890, y: 340 }, elbow: { x: 940, y: 340 }, shelf: { x: 1060, y: 340 }, align: 'start' },
    },
    {
      id: 'battery',
      pocket: { x: 790, y: 560, w: 200, h: 110 },
      callout: { anchor: { x: 990, y: 600 }, elbow: { x: 1030, y: 600 }, shelf: { x: 1150, y: 600 }, align: 'start' },
    },
    {
      id: 'speaker',
      pocket: { x: 1140, y: 166, w: 190, h: 130 },
      callout: { anchor: { x: 1140, y: 210 }, elbow: { x: 1100, y: 210 }, shelf: { x: 980, y: 210 }, align: 'end' },
    },
    {
      id: 'ptt',
      pocket: { x: 1020, y: 370, w: 130, h: 180 },
      callout: { anchor: { x: 1150, y: 440 }, elbow: { x: 1190, y: 440 }, shelf: { x: 1310, y: 440 }, align: 'start' },
    },
    {
      id: 'clip',
      pocket: { x: 516, y: 520, w: 150, h: 100 },
      callout: { anchor: { x: 591, y: 620 }, elbow: { x: 591, y: 646 }, shelf: { x: 720, y: 646 }, align: 'start' },
    },
  ],
};

/*
  Узкая ширина. Тот же набор из шести частей и те же выноски, но разбор идёт
  сверху вниз одной колонкой: 390 логических единиц по ширине — это ровно
  390px устройства, и ничего не обрезается. Строка назначения снята: при
  вписывании в экран её кегль упал бы ниже читаемого.
*/
const NARROW_ROWS = [95, 202, 309, 416, 523, 630];
const NARROW_X = 78;

const narrowSlot = (id, row, w, h) => {
  const cy = NARROW_ROWS[row];

  return {
    id,
    pocket: { x: NARROW_X - w / 2, y: cy - h / 2, w, h },
    callout: {
      anchor: { x: NARROW_X + w / 2, y: cy },
      elbow: { x: 122, y: cy },
      shelf: { x: 210, y: cy },
      align: 'start',
    },
  };
};

export const NARROW_LAYOUT = {
  width: 390,
  height: 800,
  shell: { x: 16, y: 24, w: 358, h: 752 },
  bed: { x: 32, y: 40, w: 326, h: 644 },
  band: { x: 32, y: 684, w: 326, h: 92 },
  openScale: 0.3,
  packedScale: 0.26,
  packedCenter: { x: 195, y: 385 },
  nameSize: 16,
  roleSize: 0,
  slots: [
    narrowSlot('antenna', 0, 24, 94),
    narrowSlot('body', 1, 62, 96),
    narrowSlot('battery', 2, 64, 42),
    narrowSlot('speaker', 3, 60, 42),
    narrowSlot('ptt', 4, 42, 58),
    narrowSlot('clip', 5, 54, 38),
  ],
};

/** Порядок частей в упаковочном листе — один на обе раскладки. */
export const PART_ORDER = ['antenna', 'body', 'battery', 'speaker', 'ptt', 'clip'];
