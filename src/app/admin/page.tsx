'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AuthForm } from '@/features/auth/components/AuthForm';
import { AvailabilityEditor } from '@/features/admin/components/AvailabilityEditor';
import { BookingsList } from '@/features/admin/components/BookingsList';

type Tab = 'bookings' | 'schedule';

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const logout = useAuthStore((s) => s.logout);
  const [tab, setTab] = useState<Tab>('bookings');

  /**
   * До завершення гідратації з localStorage не рендеримо нічого —
   * інакше залогинений користувач на мить бачив би форму входу
   * (persist ще не встиг відновити стан), що виглядає як баг.
   */
  if (!isHydrated) {
    return null;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <AuthForm />
      </main>
    );
  }

  const publicLink = `/book/${user.id}`;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Панель керування</h1>
          <p className="mt-1 text-sm text-muted">{user.name} · {user.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-text"
        >
          Вийти
        </button>
      </header>

      <div className="mb-8 rounded-md bg-brand-soft p-4">
        <p className="text-sm font-medium text-brand">Ваше посилання для клієнтів</p>
        <a
          href={publicLink}
          className="mt-1 block break-all text-sm text-brand underline"
          target="_blank"
          rel="noreferrer"
        >
          {publicLink}
        </a>
      </div>

      <nav className="mb-6 flex gap-1 border-b border-border">
        {([
          ['bookings', 'Бронювання'],
          ['schedule', 'Розклад'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === value
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'bookings' ? <BookingsList /> : <AvailabilityEditor />}
    </main>
  );
}
