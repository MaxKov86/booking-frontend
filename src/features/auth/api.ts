import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/shared/lib/apiClient';
import { useAuthStore, type AuthUser } from '@/store/authStore';

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => setSession(data),
  });
}

interface RegisterInput extends LoginInput {
  name: string;
  slug: string;
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => setSession(data),
  });
}
