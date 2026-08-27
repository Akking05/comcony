import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api.js';
import { Button, ErrorState, Input, PageHeader, Panel, Spinner, Textarea, useToast } from '../components/ui.jsx';

const GROUP_LABEL = {
  contacts: 'Контакты',
  about: 'О компании',
  general: 'Общее',
};

export default function Texts({ user }) {
  const [texts, setTexts] = useState(null);
  const [values, setValues] = useState({});
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
        setValues(Object.fromEntries(rows.map((row) => [row.key, row.value])));
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

  const changed = useMemo(
    () => (texts ?? []).filter((row) => values[row.key] !== row.value).map((row) => row.key),
    [texts, values],
  );

  const save = async () => {
    if (!changed.length) return;

    setSaving(true);
    try {
      await adminApi.saveTexts(Object.fromEntries(changed.map((key) => [key, values[key]])));
      setTexts((current) => current.map((row) => ({ ...row, value: values[row.key] })));
      notify(`Сохранено полей: ${changed.length}`);
    } catch (saveError) {
      notify(saveError.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!texts) return <Spinner />;

  return (
    <>
      <PageHeader title="Тексты сайта" description="Контент страниц «Контакты» и «О компании»">
        {!readOnly && (
          <Button variant="primary" icon="save" disabled={saving || !changed.length} onClick={save}>
            {saving ? 'Сохраняем…' : changed.length ? `Сохранить (${changed.length})` : 'Сохранено'}
          </Button>
        )}
      </PageHeader>

      <fieldset disabled={readOnly} className="space-y-6">
        {groups.map(([group, rows]) => (
          <Panel key={group} title={GROUP_LABEL[group] ?? group}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {rows.map((row) => {
                const isChanged = values[row.key] !== row.value;

                return (
                  <label key={row.key} className={row.type === 'textarea' ? 'lg:col-span-2' : ''}>
                    <span className="mb-1.5 flex items-center gap-2 font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                      {row.label}
                      {isChanged && <span className="h-1.5 w-1.5 rounded-full bg-primary" title="Изменено"></span>}
                    </span>

                    {row.type === 'textarea' ? (
                      <Textarea
                        rows={3}
                        value={values[row.key] ?? ''}
                        onChange={(event) => setValues({ ...values, [row.key]: event.target.value })}
                      />
                    ) : (
                      <Input
                        value={values[row.key] ?? ''}
                        onChange={(event) => setValues({ ...values, [row.key]: event.target.value })}
                      />
                    )}

                    <span className="mt-1 block font-label-sm text-[10px] text-outline/70">{row.key}</span>
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
