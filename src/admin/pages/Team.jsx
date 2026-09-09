import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../api.js';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  PageHeader,
  Spinner,
  useToast,
} from '../components/ui.jsx';
import { LangTabs, translatable } from '../lib/translatable.jsx';

function MemberForm({ member, lang, onLang, onChange, onSave, onCancel }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      const uploaded = await adminApi.upload(file);
      onChange({ ...member, photo: uploaded.path });
    } catch (uploadError) {
      notify(uploadError.message, 'error');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80" onClick={onCancel}></div>
      <div className="relative w-full max-w-lg rounded-sm border border-hairline bg-ground p-6">
        <h2 className="mb-5 font-title-md text-[18px] uppercase text-ink">
          {member.id ? 'Изменить сотрудника' : 'Новый сотрудник'}
        </h2>

        {/* Имя тоже переводится: кириллица англоязычному посетителю
            нечитаема, в английской версии нужна латиница. Фото и теги
            от языка не зависят. */}
        <LangTabs lang={lang} onChange={onLang} className="mb-5" />

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-28 w-24 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-part-fill">
              {member.photo ? (
                <img src={member.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stencil-dim">
                  <span className="material-symbols-outlined">person</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <Input
                value={member.photo ?? ''}
                onChange={(event) => onChange({ ...member, photo: event.target.value })}
                placeholder="/uploads/… или URL"
              />
              <Button icon="upload" disabled={busy} onClick={() => inputRef.current?.click()}>
                {busy ? 'Загрузка…' : 'Загрузить фото'}
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="image/webp,image/jpeg,image/png"
                className="hidden"
                onChange={uploadPhoto}
              />
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="block font-label-md text-label-md uppercase text-ink-dim">
              Имя {lang === 'ru' && <span className="text-stencil">*</span>}
            </span>
            <Input
              autoFocus
              {...translatable(member, 'name', lang, (patch) => onChange({ ...member, ...patch }), 'Арман Искаков')}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="block font-label-md text-label-md uppercase text-ink-dim">
              Должность
            </span>
            <Input
              {...translatable(
                member,
                'position',
                lang,
                (patch) => onChange({ ...member, ...patch }),
                'Главный архитектор систем',
              )}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="block font-label-md text-label-md uppercase text-ink-dim">
              Теги
            </span>
            <Input
              value={member.tags ?? ''}
              onChange={(event) => onChange({ ...member, tags: event.target.value })}
              placeholder="Senior Eng,PhD"
            />
            <span className="block font-label-xs text-label-xs text-ink-quiet">Через запятую, выводятся поверх фото</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button variant="primary" icon="save" onClick={onSave}>
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Team({ user }) {
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [lang, setLang] = useState('ru');
  const [confirming, setConfirming] = useState(null);
  const notify = useToast();

  const readOnly = user.role === 'viewer';

  const load = () => {
    setError(null);
    adminApi.team().then(setTeam).catch(setError);
  };

  useEffect(load, []);

  const save = async () => {
    if (!editing.name.trim()) {
      // Обязательно только русское имя — возвращаем на его вкладку.
      setLang('ru');
      notify('Укажите имя по-русски', 'error');
      return;
    }

    try {
      if (editing.id) {
        await adminApi.updateMember(editing.id, editing);
      } else {
        await adminApi.createMember(editing);
      }

      setEditing(null);
      load();
      notify('Сохранено');
    } catch (saveError) {
      notify(saveError.message, 'error');
    }
  };

  const remove = async () => {
    const member = confirming;
    setConfirming(null);

    try {
      await adminApi.deleteMember(member.id);
      load();
      notify('Сотрудник удалён');
    } catch (deleteError) {
      notify(deleteError.message, 'error');
    }
  };

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!team) return <Spinner />;

  return (
    <>
      <PageHeader title="Команда" description="Блок «Наша команда» на странице «О компании»">
        {!readOnly && (
          <Button
            variant="primary"
            icon="person_add"
            onClick={() => {
              setLang('ru');
              setEditing({ name: '', name_en: '', position: '', position_en: '', photo: '', tags: '' });
            }}
          >
            Добавить
          </Button>
        )}
      </PageHeader>

      {team.length === 0 ? (
        <EmptyState icon="groups" title="Сотрудников нет" description="Добавьте людей — они появятся на странице «О компании»." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {team.map((member) => (
            <div key={member.id} className="overflow-hidden rounded-sm border border-hairline-soft bg-part-fill">
              <div className="aspect-[3/4] bg-part-fill">
                {member.photo ? (
                  <img src={member.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stencil-dim">
                    <span className="material-symbols-outlined text-4xl">person</span>
                  </div>
                )}
              </div>

              <div className="p-3">
                <div className="truncate font-body-md text-[15px] text-ink">{member.name}</div>
                <div className="truncate font-label-xs text-label-xs text-ink-quiet">{member.position || '—'}</div>

                {!readOnly && (
                  <div className="mt-2 flex justify-end gap-1">
                    <IconButton
                      icon="edit"
                      title="Изменить"
                      onClick={() => {
                        setLang('ru');
                        setEditing({ ...member });
                      }}
                    />
                    <IconButton icon="delete" title="Удалить" onClick={() => setConfirming(member)} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <MemberForm
          member={editing}
          lang={lang}
          onLang={setLang}
          onChange={setEditing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title={`Удалить «${confirming?.name}»?`}
        onConfirm={remove}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
