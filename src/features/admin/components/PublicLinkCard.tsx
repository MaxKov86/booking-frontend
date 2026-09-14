'use client';

import { useState } from 'react';

interface PublicLinkCardProps {
  userId: string;
}

/**
 * Повний URL (з доменом), а не відносний шлях — бо спеціаліст має
 * СКОПІЮВАТИ це посилання й надіслати клієнту. Відносний /book/xxx
 * у листі чи повідомленні не працює.
 *
 * window.location.origin читається в стані-ініціалізаторі, а не в тілі
 * рендеру — на сервері window не існує, і пряме звернення зламало б
 * SSR-прохід Next.js.
 */
export function PublicLinkCard({ userId }: PublicLinkCardProps) {
  const [origin] = useState(() => (typeof window === 'undefined' ? '' : window.location.origin));
  const [isCopied, setIsCopied] = useState(false);

  const publicLink = `${origin}/book/${userId}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // clipboard API недоступний (HTTP без TLS, старий браузер) —
      // мовчки ігноруємо: посилання все одно видно й можна виділити вручну
    }
  }

  return (
    <div className="rounded-lg border border-brand-soft bg-brand-soft p-4">
      <p className="text-sm font-medium text-brand">Ваше посилання для клієнтів</p>
      <p className="mt-0.5 text-xs text-muted">
        Надішліть його клієнтам — вони оберуть вільний час без реєстрації
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 break-all rounded-md bg-surface px-3 py-2 text-sm">
          {publicLink}
        </code>

        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md bg-brand px-3 py-2 text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover"
        >
          {isCopied ? 'Скопійовано' : 'Копіювати'}
        </button>

        <a
          href={`/book/${userId}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-md border border-border bg-surface px-3 py-2 text-sm transition-colors hover:text-brand"
        >
          Відкрити
        </a>
      </div>
    </div>
  );
}
