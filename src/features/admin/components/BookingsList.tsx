'use client';

import { useState } from 'react';
import { useMyBookings, useCancelBooking } from '../api';

const dateTimeFormatter = new Intl.DateTimeFormat('uk-UA', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

export function BookingsList() {
  const { data: bookings, isLoading, isError } = useMyBookings();
  const cancelBooking = useCancelBooking();

  /**
   * Date.now() у тілі рендеру зробив би компонент недетермінованим —
   * той самий props дає різний результат при кожному рендері, що
   * ламає React-припущення про чистоту (і саме на це вказує правило
   * react-hooks/purity). useState-ініціалізатор виконується один раз
   * на монтування — для розділення "минулі/майбутні бронювання"
   * цієї точності більш ніж достатньо.
   */
  const [mountedAt] = useState(() => Date.now());

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-md bg-surface-2" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-danger">Не вдалося завантажити бронювання</p>;
  }

  if (!bookings || bookings.length === 0) {
    return <p className="text-sm text-muted">Бронювань поки немає</p>;
  }

  return (
    <ul className="space-y-2">
      {bookings.map((booking) => {
        const isPast = new Date(booking.startsAt).getTime() < mountedAt;
        const isCancelled = booking.status === 'cancelled';

        return (
          <li
            key={booking._id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-4 ${
              isCancelled ? 'bg-surface-2 opacity-60' : 'bg-surface'
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {dateTimeFormatter.format(new Date(booking.startsAt))}
                {isCancelled && <span className="ml-2 text-xs text-danger">Скасовано</span>}
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {booking.clientName} · {booking.clientEmail}
              </p>
              {booking.notes && (
                <p className="mt-1 text-xs text-faint">{booking.notes}</p>
              )}
            </div>

            {/* Кнопка лише для майбутніх активних бронювань — скасовувати
                вже проведену зустріч не має сенсу */}
            {!isCancelled && !isPast && (
              <button
                type="button"
                onClick={() => cancelBooking.mutate(booking._id)}
                disabled={cancelBooking.isPending}
                className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
              >
                Скасувати
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
