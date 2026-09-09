import { stagger, useSectionMotion } from '../motion.js';
import { Ghost, Placeholder, Rail } from '../parts.jsx';

/*
  Экран 7. Таблица упаковочного листа: слева графа, справа значение.

  Значений ещё нет, и они стоят заглушками — заглушка обязана выглядеть
  заглушкой и никогда не изображать заполненную строку. Сканов и номеров
  документов у заказчика на руках нет: придуманный номер сертификата в
  тендерной закупке — риск для клиента, а не украшение.

  Движение — строки проявляются по одной сверху вниз, как пробивается лист.
*/

export function Documents({ anchor, rail, ghost, title, rows, note, valueLabel }) {
  const { ref, t } = useSectionMotion({ from: 0.05, to: 0.5 });

  return (
    <section className="kns-section" id={anchor} ref={ref}>
      <Rail>{rail}</Rail>
      <Ghost>{ghost}</Ghost>

      <h2 className="kns-heading">{title}</h2>

      <dl className="kns-table">
        {rows.map((row, index) => {
          const printed = stagger(t, index, rows.length, 0.72);

          return (
            <div
              className="kns-table-row"
              key={row}
              style={{
                opacity: 0.1 + 0.9 * printed,
                transform: `translateX(${((1 - printed) * -12).toFixed(2)}px)`,
              }}
            >
              <dt className="kns-table-key">{row}</dt>
              <dd className="kns-table-value">
                <Placeholder label={valueLabel} />
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="kns-lead mt-8 text-[15px]">{note}</p>
    </section>
  );
}
