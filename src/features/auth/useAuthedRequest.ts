import { useCallback } from 'react';
import { apiRequest, ApiError } from '@/shared/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Повертає функцію-обгортку над apiRequest, яка сама підставляє access-токен
 * і, при 401, ОДИН РАЗ пробує оновити його через refresh-токен і повторити запит.
 *
 * Це і є те, заради чого існує пара access+refresh: access живе 15хв, тому
 * без цього механізму користувача викидало б з адмінки кожні 15 хвилин.
 * Тут — прозоре продовження сесії до 7 днів (термін життя refresh-токена).
 *
 * СПРОЩЕННЯ: якщо кілька запитів отримають 401 одночасно, кожен ініціює
 * свій refresh. У продакшні тут була б черга (перший запит рефрешить,
 * решта чекають його результату) — для адмін-панелі з одним користувачем
 * і послідовними запитами це надлишкова складність.
 */
export function useAuthedRequest() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setTokens = useAuthStore((s) => s.setTokens);
  const logout = useAuthStore((s) => s.logout);

  return useCallback(
    async <T>(path: string, options: RequestInit = {}): Promise<T> => {
      try {
        return await apiRequest<T>(path, { ...options, token: accessToken });
      } catch (error) {
        const isUnauthorized = error instanceof ApiError && error.status === 401;

        if (!isUnauthorized || !refreshToken) {
          throw error;
        }

        try {
          const tokens = await apiRequest<RefreshResponse>('/api/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
          });
          setTokens(tokens);

          // Повторюємо оригінальний запит уже зі свіжим токеном
          return await apiRequest<T>(path, { ...options, token: tokens.accessToken });
        } catch {
          // Refresh теж не спрацював (прострочений/відкликаний) — сесія
          // остаточно мертва, чистимо стан і даємо помилці піднятись вище
          logout();
          throw error;
        }
      }
    },
    [accessToken, refreshToken, setTokens, logout]
  );
}
