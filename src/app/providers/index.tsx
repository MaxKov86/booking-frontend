'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * QueryClient створюється через useState (не module-level singleton) —
 * у Next.js App Router модуль може виконуватись на сервері для кількох
 * запитів одночасно; singleton означав би спільний кеш між користувачами.
 *
 * На відміну від проекту 3 (budget-tracker), тут НЕМАЄ MSW — фронтенд
 * ходить у справжній Express-бекенд, тому й провайдерів менше.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Слоти можуть застаріти будь-якої миті (інший клієнт забронював),
            // тому короткий staleTime — краще зайвий запит, ніж показати
            // вже зайнятий час як вільний
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
