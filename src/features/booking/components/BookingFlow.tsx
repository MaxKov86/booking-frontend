'use client';

import { useState } from 'react';
import { useAvailability } from '../api';
import { DatePicker } from './DatePicker';
import { SlotPicker } from './SlotPicker';
import { BookingForm } from './BookingForm';
import { BookingConfirmation } from './BookingConfirmation';
import type { TimeSlot, Booking } from '../types';

/** Date -> "YYYY-MM-DD" без зсуву таймзони (toISOString() зсунув би на UTC) */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const slotTimeFormatter = new Intl.DateTimeFormat('uk-UA', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'UTC',
});

interface BookingFlowProps {
  userId: string;
}

export function BookingFlow({ userId }: BookingFlowProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [slotTakenMessage, setSlotTakenMessage] = useState<string | null>(null);

  const { data: availability, isLoading, isError } = useAvailability(userId);

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    // Скидаємо обраний слот при зміні дати — інакше лишався б слот
    // з попереднього дня, і користувач міг би забронювати не той час
    setSelectedSlot(null);
    setSlotTakenMessage(null);
  }

  function handleSlotSelect(slot: TimeSlot) {
    setSelectedSlot(slot);
    setSlotTakenMessage(null);
  }

  /** Слот перехопили, поки користувач заповнював форму (409 з бекенду) */
  function handleSlotTaken() {
    setSelectedSlot(null);
    setSlotTakenMessage('Цей час щойно забронював інший клієнт. Оберіть, будь ласка, інший.');
  }

  function handleBookAnother() {
    setConfirmedBooking(null);
    setSelectedSlot(null);
    setSelectedDate(undefined);
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

  // Крок 4: підтвердження — займає весь простір, бо флоу завершено
  if (confirmedBooking) {
    return (
      <div className="mx-auto max-w-md">
        <BookingConfirmation
          booking={confirmedBooking}
          specialistName={availability.specialist.name}
          serviceName={availability.serviceName}
          onBookAnother={handleBookAnother}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Шапка — відповідає на питання "що я бронюю і в кого".
          Без неї сторінка була безликим календарем без контексту */}
      <header className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {availability.serviceName || 'Зустріч'}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span>
            з <span className="font-medium text-text">{availability.specialist.name}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
            {availability.slotDurationMinutes} хв
          </span>
        </div>

        {availability.serviceDescription && (
          <p className="mt-3 max-w-2xl text-sm text-muted">{availability.serviceDescription}</p>
        )}
      </header>

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
        {/* Крок 3 (форма) замінює крок 2 (вибір часу) у тій самій колонці —
            так користувач бачить обрану дату зліва як контекст, поки заповнює
            свої дані, і не гортає сторінку туди-сюди */}
        {selectedSlot ? (
          <>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              3. Ваші дані
            </h2>

            <div className="mb-4 flex items-center justify-between gap-3 rounded-md bg-brand-soft px-4 py-3 text-sm">
              <span className="font-medium text-brand">
                {slotTimeFormatter.format(new Date(selectedSlot.start))}
              </span>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="shrink-0 text-xs text-muted underline transition-colors hover:text-text"
              >
                Змінити
              </button>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <BookingForm
                userId={userId}
                slot={selectedSlot}
                onSuccess={setConfirmedBooking}
                onSlotTaken={handleSlotTaken}
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              2. Оберіть час
            </h2>

            {slotTakenMessage && (
              <p className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                {slotTakenMessage}
              </p>
            )}

            <div className="rounded-lg border border-border bg-surface p-4">
              <SlotPicker
                userId={userId}
                date={selectedDate ? toDateString(selectedDate) : null}
                selectedSlot={selectedSlot}
                onSelect={handleSlotSelect}
              />
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
