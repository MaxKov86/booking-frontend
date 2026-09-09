import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/shared/lib/apiClient';
import type { Availability, TimeSlot, Booking, CreateBookingInput } from './types';

export function useAvailability(userId: string) {
  return useQuery({
    queryKey: ['availability', userId],
    queryFn: () => apiRequest<Availability>(`/api/availability/${userId}`),
    enabled: Boolean(userId),
  });
}

/**
 * date у форматі YYYY-MM-DD або null (коли користувач ще не обрав дату).
 * enabled: false при null — не робимо марний запит до вибору дати.
 */
export function useAvailableSlots(userId: string, date: string | null) {
  return useQuery({
    queryKey: ['slots', userId, date],
    queryFn: () => apiRequest<TimeSlot[]>(`/api/availability/${userId}/slots?date=${date}`),
    enabled: Boolean(userId && date),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) =>
      apiRequest<Booking>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (_booking, variables) => {
      // Інвалідуємо слоти саме цього спеціаліста — щойно заброньований
      // час має зникнути зі списку доступних, якщо користувач повернеться
      // на ту саму дату
      queryClient.invalidateQueries({ queryKey: ['slots', variables.userId] });
    },
  });
}
