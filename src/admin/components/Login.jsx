import { useState } from 'react';
import { adminApi } from '../api.js';
import { Button, Field, Input } from './ui.jsx';

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="tech-grid pointer-events-none fixed inset-0 opacity-40"></div>

      <form
        onSubmit={submit}
        className="relative w-full max-w-sm rounded-sm border border-outline-variant bg-surface/80 p-8 backdrop-blur-xl"
      >
        <div className="mb-8 flex flex-col items-center gap-4">
          <img src="/kae-logo.svg" alt="KAE" className="h-10 object-contain" />
          <span className="font-label-sm text-[10px] uppercase tracking-[0.3em] text-outline">Панель управления</span>
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

        {error && (
          <p role="alert" className="mt-4 flex items-center gap-2 rounded-sm border border-red-400/30 bg-red-500/10 px-3 py-2 font-body-md text-body-md text-red-300">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={busy} className="mt-6 w-full py-3 font-bold uppercase tracking-widest">
          {busy ? 'Проверяем…' : 'Войти'}
        </Button>

        <a href="/" className="mt-6 block text-center font-label-sm text-[11px] uppercase tracking-widest text-outline transition-colors hover:text-primary">
          Вернуться на сайт
        </a>
      </form>
    </div>
  );
}
