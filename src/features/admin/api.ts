import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthedRequest } from '@/features/auth/useAuthedRequest';
import { useAuthStore } from '@/store/authStore';
import type { Availability, Booking, WorkingHoursWindow } from '@/features/booking/types';

export interface AvailabilityInput {
  slotDurationMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  workingHours: WorkingHoursWindow[];
}

export function useMyAvailability() {
  const authedRequest = useAuthedRequest();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ['my-availability', userId],
    queryFn: () => authedRequest<Availability>(`/api/availability/${userId}`),
    enabled: Boolean(userId),
    // 404 означає "розклад ще не налаштований" — це нормальний стан для
    // нового користувача, а не помилка, яку варто ретраїти
    retry: false,
  });
}

export function useUpdateAvailability() {
  const authedRequest = useAuthedRequest();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (input: AvailabilityInput) =>
      authedRequest<Availability>(`/api/availability/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-availability', userId] });
      // Слоти теж інвалідуємо — зміна розкладу міняє доступні часи
      queryClient.invalidateQueries({ queryKey: ['slots', userId] });
    },
  });
}

export function useMyBookings() {
  const authedRequest = useAuthedRequest();
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ['my-bookings', userId],
    queryFn: () => authedRequest<Booking[]>(`/api/bookings/${userId}`),
    enabled: Boolean(userId),
  });
}

export function useCancelBooking() {
  const authedRequest = useAuthedRequest();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (bookingId: string) =>
      authedRequest<Booking>(`/api/bookings/${bookingId}/cancel`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings', userId] });
      // Скасований слот знову стає вільним — оновлюємо й публічні слоти
      queryClient.invalidateQueries({ queryKey: ['slots', userId] });
    },
  });
}
