'use client';

import type { Booking } from '../types';

const dateTimeFormatter = new Intl.DateTimeFormat('uk-UA', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'UTC',
});

interface BookingConfirmationProps {
  booking: Booking;
  onBookAnother: () => void;
}

export function BookingConfirmation({ booking, onBookAnother }: BookingConfirmationProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-success"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="mt-4 text-lg font-semibold">Бронювання підтверджено</h2>

      <p className="mt-2 text-sm text-muted">
        Ми надіслали підтвердження на{' '}
        <span className="font-medium text-text">{booking.clientEmail}</span>
      </p>

      <div className="mt-6 rounded-md bg-brand-soft p-4 text-left">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Коли</dt>
            <dd className="text-right font-medium">
              {dateTimeFormatter.format(new Date(booking.startsAt))}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">На кого</dt>
            <dd className="text-right font-medium">{booking.clientName}</dd>
          </div>
          {booking.notes && (
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-muted">Коментар</dt>
              <dd className="text-right">{booking.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      <button
        type="button"
        onClick={onBookAnother}
        className="mt-6 text-sm text-brand transition-colors hover:text-brand-hover"
      >
        Забронювати ще один час
      </button>
    </div>
  );
}
