import { useState } from 'react';
import { adminApi } from '../api.js';
import { Button, Field, Input } from './ui.jsx';

/**
 * Вход в панель.
 *
 * Экран задачи, а не витрина: одно поле под другим, одно действие, ошибка
 * словами рядом с формой. Стекла и подложки-сетки здесь больше нет — вход
 * стоит на той же земле, что и остальная панель, и отделён от неё
 * хайрлайном, а не собственным фоном.
 */
export function Login({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError('');

    try {
      onSuccess(await adminApi.login(form.email, form.password));
    } catch (loginError) {
      setError(loginError.message);
      setBusy(false);
    }
  };

  return (
    <div className="kae-admin flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm border border-hairline p-8">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/kae-logo.svg" alt="KAE" className="h-10 object-contain" />
          <span className="font-label-2xs text-label-2xs uppercase text-ink-quiet">Панель управления</span>
        </div>

        <div className="space-y-4">
          <Field label="Email" required>
            <Input
              type="email"
              autoComplete="username"
              autoFocus
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="admin@kae-engineering.kz"
            />
          </Field>

          <Field label="Пароль" required>
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
            />
          </Field>
        </div>

        {/* Ошибку входа объявляем вслух: без role="alert" программа чтения
            с экрана оставит посетителя ждать реакции, которой не будет. */}
        {error && (
          <p
            role="alert"
            className="mt-4 flex items-center gap-2 border border-red-400/40 bg-red-500/10 px-3 py-2 font-body-md text-[15px] text-red-300"
          >
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={busy} className="mt-6 w-full py-3">
          {busy ? 'Проверяем…' : 'Войти'}
        </Button>

        <a
          href="/"
          className="mt-6 block text-center font-label-2xs text-label-2xs uppercase text-ink-quiet transition-colors hover:text-ink"
        >
          Вернуться на сайт
        </a>
      </form>
    </div>
  );
}
