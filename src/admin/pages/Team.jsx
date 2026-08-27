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

function MemberForm({ member, onChange, onSave, onCancel }) {
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
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-lg rounded-sm border border-outline-variant bg-surface p-6">
        <h2 className="mb-5 font-headline-md text-[18px] text-white">
          {member.id ? 'Изменить сотрудника' : 'Новый сотрудник'}
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-28 w-24 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-surface-container-high">
              {member.photo ? (
                <img src={member.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-outline/40">
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
            <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              Имя <span className="text-primary">*</span>
            </span>
            <Input
              autoFocus
              value={member.name}
              onChange={(event) => onChange({ ...member, name: event.target.value })}
              placeholder="Арман Искаков"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              Должность
            </span>
            <Input
              value={member.position ?? ''}
              onChange={(event) => onChange({ ...member, position: event.target.value })}
              placeholder="Главный архитектор систем"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              Теги
            </span>
            <Input
              value={member.tags ?? ''}
              onChange={(event) => onChange({ ...member, tags: event.target.value })}
              placeholder="Senior Eng,PhD"
            />
            <span className="block font-label-sm text-[11px] text-outline">Через запятую, выводятся поверх фото</span>
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
      notify('Укажите имя', 'error');
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
            onClick={() => setEditing({ name: '', position: '', photo: '', tags: '' })}
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
            <div key={member.id} className="overflow-hidden rounded-sm border border-outline-variant/60 bg-surface/40">
              <div className="aspect-[3/4] bg-surface-container-high">
                {member.photo ? (
                  <img src={member.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-outline/30">
                    <span className="material-symbols-outlined text-4xl">person</span>
                  </div>
                )}
              </div>

              <div className="p-3">
                <div className="truncate font-label-md text-label-md text-white">{member.name}</div>
                <div className="truncate font-label-sm text-[11px] text-outline">{member.position || '—'}</div>

                {!readOnly && (
                  <div className="mt-2 flex justify-end gap-1">
                    <IconButton icon="edit" title="Изменить" onClick={() => setEditing({ ...member })} />
                    <IconButton icon="delete" title="Удалить" onClick={() => setConfirming(member)} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <MemberForm member={editing} onChange={setEditing} onSave={save} onCancel={() => setEditing(null)} />
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
