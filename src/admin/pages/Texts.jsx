import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api.js';
import { Button, ErrorState, Input, PageHeader, Panel, Spinner, Textarea, useToast } from '../components/ui.jsx';
import { LangTabs } from '../lib/translatable.jsx';

const GROUP_LABEL = {
  home: 'Главная',
  contacts: 'Контакты',
  about: 'О компании',
  general: 'Общее',
};

/**
 * У каждого текста два значения: русское (value) и английское (value_en).
 * Правятся они по очереди, а не в двух колонках сразу: полей на странице
 * под семьдесят, и в две колонки они перестают помещаться на любом экране.
 */
const TABS = [
  { lang: 'ru', column: 'value' },
  { lang: 'en', column: 'value_en' },
];

export default function Texts({ user }) {
  const [texts, setTexts] = useState(null);
  const [values, setValues] = useState({ value: {}, value_en: {} });
  const [tab, setTab] = useState(TABS[0]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const notify = useToast();

  const readOnly = user.role === 'viewer';

  const load = () => {
    setError(null);
    adminApi
      .texts()
      .then((rows) => {
        setTexts(rows);
        setValues({
          value: Object.fromEntries(rows.map((row) => [row.key, row.value])),
          // Старый снимок базы мог приехать без колонки — тогда поле пустое.
          value_en: Object.fromEntries(rows.map((row) => [row.key, row.value_en ?? ''])),
        });
      })
      .catch(setError);
  };

  useEffect(load, []);

  const groups = useMemo(() => {
    if (!texts) return [];

    const map = new Map();
    for (const row of texts) {
      if (!map.has(row.group_name)) map.set(row.group_name, []);
      map.get(row.group_name).push(row);
    }

    return [...map.entries()];
  }, [texts]);

  // Считаем правки по обоим языкам сразу: переключение вкладки не должно
  // выглядеть так, будто набранное на другой пропало.
  const changed = useMemo(() => {
    const result = { value: [], value_en: [] };

    for (const row of texts ?? []) {
      for (const { column } of TABS) {
        if (values[column][row.key] !== (row[column] ?? '')) result[column].push(row.key);
      }
    }

    return result;
  }, [texts, values]);

  const changedCount = changed.value.length + changed.value_en.length;

  const save = async () => {
    if (!changedCount) return;

    setSaving(true);
    try {
      await adminApi.saveTexts({
        values: Object.fromEntries(changed.value.map((key) => [key, values.value[key]])),
        values_en: Object.fromEntries(changed.value_en.map((key) => [key, values.value_en[key]])),
      });

      setTexts((current) =>
        current.map((row) => ({ ...row, value: values.value[row.key], value_en: values.value_en[row.key] })),
      );
      notify(`Сохранено полей: ${changedCount}`);
    } catch (saveError) {
      notify(saveError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!texts) return <Spinner />;

  const setField = (key, value) =>
    setValues((current) => ({ ...current, [tab.column]: { ...current[tab.column], [key]: value } }));

  return (
    <>
      <PageHeader
        title="Тексты сайта"
        description="Содержимое страниц «Главная», «Контакты» и «О компании» на двух языках"
      >
        {!readOnly && (
          <Button variant="primary" icon="save" disabled={saving || !changedCount} onClick={save}>
            {saving ? 'Сохраняем…' : changedCount ? `Сохранить (${changedCount})` : 'Сохранено'}
          </Button>
        )}
      </PageHeader>

      <LangTabs
        lang={tab.lang}
        onChange={(code) => setTab(TABS.find((item) => item.lang === code) ?? TABS[0])}
        pending={{ ru: changed.value.length, en: changed.value_en.length }}
        className="mb-5"
      />

      <fieldset disabled={readOnly} className="space-y-6">
        {groups.map(([group, rows]) => (
          <Panel key={group} title={GROUP_LABEL[group] ?? group}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {rows.map((row) => {
                const value = values[tab.column][row.key] ?? '';
                const isChanged = value !== (row[tab.column] ?? '');
                const original = row.value;

                // На английской вкладке русский текст стоит подсказкой:
                // пустое поле именно так и покажется на сайте — по-русски.
                const translating = tab.lang !== 'ru';

                return (
                  <label key={row.key} className={row.type === 'textarea' ? 'lg:col-span-2' : ''}>
                    <span className="mb-1.5 flex items-center gap-2 font-label-md text-label-md uppercase text-ink-dim">
                      {row.label}
                      {isChanged && <span className="h-1.5 w-1.5 rounded-full bg-accent" title="Изменено"></span>}
                    </span>

                    {translating && original && (
                      <span className="mb-1.5 block border-l-2 border-hairline-soft pl-2 font-body-md text-[13px] leading-snug text-ink-quiet">
                        {original}
                      </span>
                    )}

                    {row.type === 'textarea' ? (
                      <Textarea
                        rows={3}
                        lang={tab.lang}
                        value={value}
                        placeholder={translating ? original : ''}
                        onChange={(event) => setField(row.key, event.target.value)}
                      />
                    ) : (
                      <Input
                        lang={tab.lang}
                        value={value}
                        placeholder={translating ? original : ''}
                        onChange={(event) => setField(row.key, event.target.value)}
                      />
                    )}

                    <span className="mt-1 block font-label-2xs text-label-2xs text-ink-quiet">{row.key}</span>
                  </label>
                );
              })}
            </div>
          </Panel>
        ))}
      </fieldset>
    </>
  );
}
