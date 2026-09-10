'use client';

import { useState, type FormEvent } from 'react';
import { useLogin, useRegister } from '../api';
import { ApiError } from '@/shared/lib/apiClient';

const inputClassName =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none';
const labelClassName = 'mb-1.5 block text-sm font-medium';

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = useLogin();
  const register = useRegister();
  const isPending = login.isPending || register.isPending;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        await login.mutateAsync({ email, password });
      } else {
        await register.mutateAsync({ email, password, name, slug });
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Не вдалося увійти. Спробуйте ще раз.'
      );
    }
  }

  function switchMode() {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setErrorMessage(null);
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold tracking-tight">
        {mode === 'login' ? 'Вхід для спеціалістів' : 'Реєстрація'}
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        {mode === 'login'
          ? 'Увійдіть, щоб керувати розкладом і бронюваннями'
          : 'Створіть акаунт, щоб приймати бронювання'}
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errorMessage && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-danger">{errorMessage}</p>
        )}

        {mode === 'register' && (
          <>
            <div>
              <label className={labelClassName} htmlFor="name">
                Ваше ім&apos;я
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="slug">
                Slug для посилання
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="ivan-petrenko"
                className={inputClassName}
                required
              />
              <p className="mt-1 text-xs text-muted">Лише малі літери, цифри та дефіси</p>
            </div>
          </>
        )}

        <div>
          <label className={labelClassName} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
            required
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="password">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            required
          />
          {mode === 'register' && (
            <p className="mt-1 text-xs text-muted">Щонайменше 8 символів</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          {isPending ? 'Зачекайте...' : mode === 'login' ? 'Увійти' : 'Зареєструватись'}
        </button>
      </form>

      <button
        type="button"
        onClick={switchMode}
        className="mt-4 w-full text-sm text-brand transition-colors hover:text-brand-hover"
      >
        {mode === 'login' ? 'Немає акаунта? Зареєструватись' : 'Вже маєте акаунт? Увійти'}
      </button>
    </div>
  );
}
