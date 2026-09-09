import { useId, useState } from 'react';

import { api } from '../lib/api.js';
import { useLang } from '../lib/i18n.jsx';
import { Button, Icon } from './ui/index.js';

/*
  Запрос коммерческого предложения — целевое действие карточки позиции
  (`PRODUCT.md`: главная заявку не собирает, запрос КП живёт глубже).

  Форма не изображает отправку: она пишет заявку в таблицу `requests` через
  тот же публичный API, что и форма контактов, привязывает её к позиции по
  slug — и заявка сразу видна в админке. Мнимое «письмо отправлено» стоило бы
  закупщику сорванного срока.

  Проверка полей повторяет серверную, а не заменяет её: сервер остаётся
  единственным, чьё «нет» окончательно. Здесь она нужна только чтобы не
  гонять посетителя за ответом через сеть.
*/

const EMPTY = { name: '', email: '', phone: '', message: '' };

/** Тот же формат, что проверяет сервер: одна собака, точка в домене. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Что не так с формой. Ключ — поле, значение — готовая строка.
 * Пустой объект означает «можно отправлять».
 */
export function faultsOf(values, t) {
  const faults = {};

  if (!values.name.trim()) faults.name = t('quote.error_name');
  if (!values.email.trim() && !values.phone.trim()) faults.email = t('quote.error_contact');
  else if (values.email.trim() && !EMAIL.test(values.email.trim())) faults.email = t('quote.error_email');

  return faults;
}

function Field({ id, label, hint, value, fault, multiline, type = 'text', required, onChange }) {
  const described = [hint ? `${id}-hint` : null, fault ? `${id}-error` : null].filter(Boolean).join(' ');

  const common = {
    id,
    name: id,
    value,
    onChange,
    'aria-invalid': fault ? true : undefined,
    'aria-describedby': described || undefined,
    className: `w-full border bg-transparent px-4 py-3 font-body-md text-body-md text-ink outline-none transition-colors placeholder:text-ink-quiet focus:border-stencil ${
      fault ? 'border-ink-quiet' : 'border-hairline'
    }`,
  };

  return (
    <div>
      <label htmlFor={id} className="font-label-2xs text-label-2xs mb-2 block uppercase text-stencil">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      {hint && (
        <span id={`${id}-hint`} className="font-body-sm text-body-sm mb-2 block text-ink-dim">
          {hint}
        </span>
      )}

      {multiline ? (
        <textarea rows={4} {...common} />
      ) : (
        <input type={type} {...common} />
      )}

      {fault && (
        <span id={`${id}-error`} className="font-body-sm text-body-sm mt-2 block text-ink">
          {fault}
        </span>
      )}
    </div>
  );
}

export function QuoteForm({ product }) {
  const prefix = useId();
  const { t } = useLang();

  const [values, setValues] = useState(EMPTY);
  const [faults, setFaults] = useState({});
  const [state, setState] = useState('idle');
  const [failure, setFailure] = useState('');

  const update = (field) => (event) =>
    setValues((previous) => ({ ...previous, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (state === 'sending') return;

    const found = faultsOf(values, t);
    setFaults(found);

    if (Object.keys(found).length > 0) return;

    setState('sending');
    setFailure('');

    try {
      await api.submitRequest({
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.message,
        subject: t('quote.subject', { name: product.name }),
        product_slug: product.slug,
        path: window.location.pathname,
      });

      setValues(EMPTY);
      setState('sent');
    } catch (error) {
      setFailure(error.message || t('quote.error_send'));
      setState('idle');
    }
  };

  if (state === 'sent') {
    return (
      <div className="mt-stack-md flex max-w-[62ch] flex-col items-start gap-4 border border-hairline p-stack-md">
        <Icon name="check" size="xl" className="text-stencil" />
        <h3 className="kns-display text-headline-md text-ink">{t('quote.success_title')}</h3>
        <p className="font-body-md text-body-md text-ink-dim">{t('quote.success_text')}</p>
        <Button variant="ghost" onClick={() => setState('idle')}>
          {t('quote.success_again')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="mt-stack-sm max-w-[58ch] font-body-md text-body-md text-ink-dim">{t('quote.intro')}</p>

      <form onSubmit={submit} noValidate className="mt-stack-md grid max-w-[62ch] gap-stack-sm">
        <Field
          id={`${prefix}-name`}
          label={t('quote.field_name')}
          value={values.name}
          fault={faults.name}
          required
          onChange={update('name')}
        />

        <div className="grid gap-stack-sm sm:grid-cols-2">
          <Field
            id={`${prefix}-email`}
            type="email"
            label={t('quote.field_email')}
            hint={t('quote.hint_contact')}
            value={values.email}
            fault={faults.email}
            onChange={update('email')}
          />
          <Field
            id={`${prefix}-phone`}
            type="tel"
            label={t('quote.field_phone')}
            value={values.phone}
            onChange={update('phone')}
          />
        </div>

        <Field
          id={`${prefix}-message`}
          label={t('quote.field_message')}
          value={values.message}
          multiline
          onChange={update('message')}
        />

        <div className="mt-stack-xs flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" disabled={state === 'sending'}>
            {state === 'sending' ? t('quote.sending') : t('quote.submit')}
          </Button>
          <span className="font-label-2xs text-label-2xs text-ink-quiet">* {t('quote.required')}</span>
        </div>
      </form>

      {/* Живая область стоит всегда: ответ, появившийся внутри неё,
          прочитывается вслух без переноса фокуса. */}
      <div role="status" aria-live="polite">
        {failure && <p className="mt-stack-sm max-w-[58ch] font-body-md text-body-md text-ink">{failure}</p>}
      </div>
    </>
  );
}

export default QuoteForm;
