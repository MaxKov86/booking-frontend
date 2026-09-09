'use client';

import { useState } from 'react';
import { useAvailability } from '../api';
import { DatePicker } from './DatePicker';
import { SlotPicker } from './SlotPicker';
import type { TimeSlot } from '../types';

/** Date -> "YYYY-MM-DD" без зсуву таймзони (toISOString() зсунув би на UTC) */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface BookingFlowProps {
  userId: string;
}

export function BookingFlow({ userId }: BookingFlowProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const { data: availability, isLoading, isError } = useAvailability(userId);

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    // Скидаємо обраний слот при зміні дати — інакше лишався б слот
    // з попереднього дня, і користувач міг би випадково забронювати не той час
    setSelectedSlot(null);
  }

  if (isLoading) {
    return <p className="text-sm text-muted">Завантаження...</p>;
  }

  if (isError || !availability) {
    return (
      <p className="text-sm text-danger">
        Не вдалося завантажити розклад. Можливо, спеціаліст ще не налаштував доступність.
      </p>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          1. Оберіть дату
        </h2>
        <div className="rounded-lg border border-border bg-surface p-4">
          <DatePicker
            availability={availability}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          2. Оберіть час
        </h2>
        <div className="rounded-lg border border-border bg-surface p-4">
          <SlotPicker
            userId={userId}
            date={selectedDate ? toDateString(selectedDate) : null}
            selectedSlot={selectedSlot}
            onSelect={setSelectedSlot}
          />
        </div>

        {selectedSlot && (
          <p className="mt-4 rounded-md bg-brand-soft p-3 text-sm text-brand">
            Обрано: {new Date(selectedSlot.start).toLocaleString('uk-UA', { timeZone: 'UTC' })}
            <br />
            <span className="text-muted">Форма бронювання — на наступному кроці</span>
          </p>
        )}
      </div>
    </div>
  );
}
