import { useEffect, useState } from 'react';
import { adminApi } from '../api.js';
import {
  Badge,
  Button,
  ConfirmDialog,
  ErrorState,
  IconButton,
  Input,
  PageHeader,
  Panel,
  Select,
  Spinner,
  formatDate,
  useToast,
} from '../components/ui.jsx';

const ROLES = [
  { value: 'admin', label: 'Администратор', hint: 'Полный доступ, включая пользователей' },
  { value: 'editor', label: 'Редактор', hint: 'Управляет контентом, но не пользователями' },
  { value: 'viewer', label: 'Наблюдатель', hint: 'Только просмотр' },
];

const EMPTY = { email: '', name: '', password: '', role: 'editor' };

export default function Users({ user }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const notify = useToast();

  const load = () => {
    setError(null);
    adminApi.users().then(setUsers).catch(setError);
  };

  useEffect(load, []);

  const create = async () => {
    try {
      await adminApi.createUser(creating);
      setCreating(null);
      load();
      notify('Пользователь создан');
    } catch (createError) {
      notify(createError.message, 'error');
    }
  };

  const changeRole = async (id, role) => {
    try {
      await adminApi.updateUser(id, { role });
      load();
      notify('Роль обновлена');
    } catch (roleError) {
      notify(roleError.message, 'error');
      load();
    }
  };

  const resetPassword = async () => {
    try {
      await adminApi.updateUser(resetting.id, { password: resetting.password });
      setResetting(null);
      notify('Пароль изменён');
    } catch (resetError) {
      notify(resetError.message, 'error');
    }
  };

  const remove = async () => {
    const target = confirming;
    setConfirming(null);

    try {
      await adminApi.deleteUser(target.id);
      load();
      notify('Пользователь удалён');
    } catch (deleteError) {
      notify(deleteError.message, 'error');
    }
  };

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!users) return <Spinner />;

  return (
    <>
      <PageHeader title="Пользователи" description="Доступ к панели управления">
        <Button variant="primary" icon="person_add" onClick={() => setCreating({ ...EMPTY })}>
          Добавить
        </Button>
      </PageHeader>

      <div className="mb-6 overflow-x-auto rounded-sm border border-outline-variant/60">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/60 bg-surface/60">
              <th className="px-4 py-3 text-left font-label-sm text-[10px] uppercase tracking-widest text-outline">
                Пользователь
              </th>
              <th className="px-4 py-3 text-left font-label-sm text-[10px] uppercase tracking-widest text-outline">
                Роль
              </th>
              <th className="hidden px-4 py-3 text-left font-label-sm text-[10px] uppercase tracking-widest text-outline lg:table-cell">
                Последний вход
              </th>
              <th className="w-24 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id} className="border-b border-outline-variant/30 last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-white">{item.name}</span>
                    {item.id === user.id && <Badge tone="success">это вы</Badge>}
                  </div>
                  <div className="font-label-sm text-[11px] text-outline">{item.email}</div>
                </td>

                <td className="px-4 py-3">
                  <Select value={item.role} onChange={(event) => changeRole(item.id, event.target.value)} className="w-auto">
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                </td>

                <td className="hidden px-4 py-3 font-label-sm text-[11px] text-outline lg:table-cell">
                  {formatDate(item.last_login_at)}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconButton
                      icon="key"
                      title="Сменить пароль"
                      onClick={() => setResetting({ id: item.id, name: item.name, password: '' })}
                    />
                    <IconButton
                      icon="delete"
                      title="Удалить"
                      disabled={item.id === user.id}
                      onClick={() => setConfirming(item)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Panel title="Что могут роли">
        <ul className="space-y-2">
          {ROLES.map((role) => (
            <li key={role.value} className="flex flex-wrap items-center gap-3">
              <Badge tone={role.value === 'admin' ? 'success' : 'neutral'}>{role.label}</Badge>
              <span className="font-body-md text-body-md text-on-surface-variant">{role.hint}</span>
            </li>
          ))}
        </ul>
      </Panel>

      {creating && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setCreating(null)}></div>
          <div className="relative w-full max-w-md rounded-sm border border-outline-variant bg-surface p-6">
            <h2 className="mb-5 font-headline-md text-[18px] text-white">Новый пользователь</h2>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Email <span className="text-primary">*</span>
                </span>
                <Input
                  autoFocus
                  type="email"
                  value={creating.email}
                  onChange={(event) => setCreating({ ...creating, email: event.target.value })}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Имя
                </span>
                <Input
                  value={creating.name}
                  onChange={(event) => setCreating({ ...creating, name: event.target.value })}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Пароль <span className="text-primary">*</span>
                </span>
                <Input
                  type="password"
                  value={creating.password}
                  onChange={(event) => setCreating({ ...creating, password: event.target.value })}
                />
                <span className="block font-label-sm text-[11px] text-outline">Не короче 10 символов</span>
              </label>

              <label className="block space-y-1.5">
                <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Роль
                </span>
                <Select
                  value={creating.role}
                  onChange={(event) => setCreating({ ...creating, role: event.target.value })}
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCreating(null)}>
                Отмена
              </Button>
              <Button variant="primary" icon="person_add" onClick={create}>
                Создать
              </Button>
            </div>
          </div>
        </div>
      )}

      {resetting && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setResetting(null)}></div>
          <div className="relative w-full max-w-md rounded-sm border border-outline-variant bg-surface p-6">
            <h2 className="mb-2 font-headline-md text-[18px] text-white">Новый пароль</h2>
            <p className="mb-5 font-body-md text-body-md text-on-surface-variant">
              Для пользователя «{resetting.name}»
            </p>

            <Input
              autoFocus
              type="password"
              value={resetting.password}
              onChange={(event) => setResetting({ ...resetting, password: event.target.value })}
              placeholder="Не короче 10 символов"
            />

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setResetting(null)}>
                Отмена
              </Button>
              <Button variant="primary" icon="key" onClick={resetPassword}>
                Сменить
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title={`Удалить «${confirming?.name}»?`}
        description="Пользователь потеряет доступ к панели управления."
        onConfirm={remove}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
