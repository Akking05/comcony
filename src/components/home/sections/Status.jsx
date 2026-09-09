import { numeral, useSectionMotion } from '../motion.js';
import { Ghost, Rail } from '../parts.jsx';

/*
  Экран 2. Полоса трафаретной маркировки в край экрана.

  Движение — прокатка: краска ложится слева направо одним проходом валика,
  и утверждение проявляется вместе с ней. Конечное состояние — полоса
  напечатана целиком, поэтому без движения видно всё.

  Подписи под утверждением — тексты владельца сайта из базы (группа
  «Главная», преимущества). Пустое преимущество не превращается в пустую
  колонку: его просто нет.
*/

export function Status({ anchor, rail, ghost, statement, signatures }) {
  const { ref, t } = useSectionMotion({ from: 0.08, to: 0.46, ease: false });
  const rolled = { clipPath: `inset(0 ${((1 - t) * 100).toFixed(2)}% 0 0)` };

  return (
    <section className="kns-section kns-section-tight" id={anchor} ref={ref}>
      <Rail>{rail}</Rail>
      <Ghost>{ghost}</Ghost>

      <div className="kns-status-band">
        <span className="kns-status-roll" style={rolled} aria-hidden="true" />

        {/* Утверждение — заголовок экрана: у полосы маркировки другого нет. */}
        <h2 className="kns-statement" style={rolled}>
          {statement}
        </h2>

        {signatures.length > 0 && (
          <ul className="kns-signs">
            {signatures.map((signature, index) => (
              <li className="kns-sign" key={signature.title} style={rolled}>
                <span className="kns-sign-index">{numeral(index)}</span>
                <span className="kns-sign-title">{signature.title}</span>
                {signature.line ? <span className="kns-sign-line">{signature.line}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
