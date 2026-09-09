import { Icon } from './Icon.jsx';
import { Panel } from './Panel.jsx';

/**
 * Сообщение вместо содержимого: пусто, не загрузилось, не найдено.
 *
 * Раньше каждый такой случай верстался на месте, и они разошлись: где-то
 * иконка была, где-то нет, отступы и размер текста не совпадали. Состояний
 * станет больше вместе с новыми разделами, поэтому вид у них общий.
 */
export function StatusBlock({ icon = 'info', title, text, tone = 'muted', className = '', children }) {
  return (
    <Panel
      tier="card"
      className={`border p-8 text-center md:p-12 ${
        tone === 'primary' ? 'border-hairline' : 'border-hairline-soft'
      } ${className}`}
    >
      <Icon name={icon} size="2xl" className="mb-5 text-stencil-dim" />

      {title && <h2 className="mb-3 font-headline-md text-headline-md text-ink">{title}</h2>}
      {text && <p className="mx-auto max-w-md font-body-md text-body-md text-ink-dim">{text}</p>}

      {children && <div className="mt-8 flex flex-wrap justify-center gap-4">{children}</div>}
    </Panel>
  );
}
