/*
  Мелочи, общие для восьми экранов: заглушка, борт с подписью секции и
  ghost-нумерал. Ни одна из них не знает, в какой секции стоит.
*/

/**
 * Заглушка `[ значение ]`.
 *
 * Существует ради одного правила: отсутствие данных должно быть видно.
 * Поэтому у неё своя гарнитура, скобки и пунктир — она не бледная копия
 * значения, а другая форма, и выдать её за заполненное поле нельзя.
 * Приглушения прозрачностью здесь нет намеренно: оно уронило бы контраст
 * ниже 4.5:1.
 */
export function Placeholder({ label, className = '' }) {
  return (
    <span className={`kns-placeholder ${className}`} data-placeholder="">
      <span className="kns-placeholder-bracket" aria-hidden="true">
        [
      </span>
      &nbsp;{label}&nbsp;
      <span className="kns-placeholder-bracket" aria-hidden="true">
        ]
      </span>
    </span>
  );
}

/** Подпись секции по борту — вертикальный трафарет вместо оверлайна. */
export function Rail({ children }) {
  return (
    <div className="kns-rail" aria-hidden="true">
      <span className="kns-rail-text">{children}</span>
    </div>
  );
}

/** Номер экрана, набитый по борту в четверть краски. */
export function Ghost({ children }) {
  return (
    <span className="kns-ghost" aria-hidden="true">
      {children}
    </span>
  );
}
