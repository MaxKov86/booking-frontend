import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  slug: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** false до гідратації з localStorage — щоб не блимати логін-формою для залогиненого */
  isHydrated: boolean;
}

interface AuthActions {
  setSession: (data: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  setTokens: (data: { accessToken: string; refreshToken: string }) => void;
  setHydrated: () => void;
  logout: () => void;
}

/**
 * Токени в localStorage — свідоме спрощення для pet-проекту, з відомим
 * компромісом: httpOnly-cookie безпечніші (недоступні для JS, тому XSS
 * не може вкрасти токен), але вимагають CSRF-захисту й ускладнюють
 * крос-доменну роботу фронтенду й бекенду на різних портах/доменах.
 * Для портфоліо-демо localStorage прийнятний; у продакшні з реальними
 * даними варто перейти на httpOnly-cookie.
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,

      setSession: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),

      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),

      setHydrated: () => set({ isHydrated: true }),

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'booking-auth',
      // isHydrated НЕ зберігаємо — це стан рантайму, не даних
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      // Викликається після відновлення з localStorage — саме тут
      // позначаємо, що чекати більше нічого й можна рендерити UI
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);
