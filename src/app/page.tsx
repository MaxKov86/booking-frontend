'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Тимчасова стартова сторінка для розробки — дозволяє ввести userId
 * спеціаліста й перейти на його сторінку бронювання. У реальному продукті
 * тут був би маркетинговий лендинг, а посилання /book/:userId кожен
 * спеціаліст роздавав би клієнтам сам.
 */
export default function Home() {
  const [userId, setUserId] = useState('');
  const router = useRouter();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (userId.trim()) {
      router.push(`/book/${userId.trim()}`);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Booking</h1>
      <p className="mt-1 text-sm text-muted">
        Введіть ID спеціаліста, щоб перейти на сторінку бронювання
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="507f1f77bcf86cd799439011"
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover"
        >
          Перейти
        </button>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-sm text-muted">
        Ви спеціаліст?{' '}
        <a href="/admin" className="text-brand transition-colors hover:text-brand-hover">
          Увійти в панель керування
        </a>
      </p>
    </main>
  );
}
