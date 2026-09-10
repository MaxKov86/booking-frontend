'use client';

import { useState, type FormEvent } from 'react';
import { useCreateBooking } from '../api';
import { validateBookingForm, type BookingFormValues, type BookingFormErrors } from '../utils/validateBookingForm';
import { ApiError } from '@/shared/lib/apiClient';
import type { TimeSlot, Booking } from '../types';

const inputClassName =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none';
const labelClassName = 'mb-1.5 block text-sm font-medium';
const errorClassName = 'mt-1 text-xs text-danger';

const EMPTY_FORM: BookingFormValues = { clientName: '', clientEmail: '', notes: '' };

interface BookingFormProps {
  userId: string;
  slot: TimeSlot;
  onSuccess: (booking: Booking) => void;
  /** Викликається при 409 — слот зайняли, треба повернути користувача до вибору часу */
  onSlotTaken: () => void;
}

export function BookingForm({ userId, slot, onSuccess, onSlotTaken }: BookingFormProps) {
  const [values, setValues] = useState<BookingFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const createBooking = useCreateBooking();

  function updateField<K extends keyof BookingFormValues>(field: K, value: BookingFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setApiErrorMessage(null);

    const validationErrors = validateBookingForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const booking = await createBooking.mutateAsync({
        userId,
        startsAt: slot.start,
        clientName: values.clientName.trim(),
        clientEmail: values.clientEmail.trim(),
        notes: values.notes.trim() || undefined,
      });
      onSuccess(booking);
    } catch (error) {
      /**
       * 409 має ОКРЕМУ обробку — це не "щось пішло не так", а конкретна
       * ситуація: поки користувач заповнював форму, інший клієнт забронював
       * цей слот. Показати generic-помилку тут було б поганим UX — користувач
       * не зрозумів би, що треба просто обрати інший час. Тому повертаємо
       * його до кроку вибору слоту (onSlotTaken), а список слотів
       * перезавантажиться свіжим (invalidateQueries у useCreateBooking).
       */
      if (error instanceof ApiError && error.status === 409) {
        onSlotTaken();
        return;
      }

      setApiErrorMessage(
        error instanceof ApiError ? error.message : 'Не вдалося забронювати. Спробуйте ще раз.'
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiErrorMessage && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-danger">{apiErrorMessage}</p>
      )}

      <div>
        <label className={labelClassName} htmlFor="clientName">
          Ваше ім&apos;я
        </label>
        <input
          id="clientName"
          type="text"
          value={values.clientName}
          onChange={(e) => updateField('clientName', e.target.value)}
          className={inputClassName}
          autoFocus
        />
        {errors.clientName && <p className={errorClassName}>{errors.clientName}</p>}
      </div>

      <div>
        <label className={labelClassName} htmlFor="clientEmail">
          Email
        </label>
        <input
          id="clientEmail"
          type="email"
          value={values.clientEmail}
          onChange={(e) => updateField('clientEmail', e.target.value)}
          className={inputClassName}
        />
        {errors.clientEmail && <p className={errorClassName}>{errors.clientEmail}</p>}
        <p className="mt-1 text-xs text-muted">На цю адресу надішлемо підтвердження</p>
      </div>

      <div>
        <label className={labelClassName} htmlFor="notes">
          Коментар <span className="font-normal text-muted">(необов&apos;язково)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          value={values.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          className={`${inputClassName} resize-none`}
        />
        {errors.notes && <p className={errorClassName}>{errors.notes}</p>}
      </div>

      <button
        type="submit"
        disabled={createBooking.isPending}
        className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-60"
      >
        {createBooking.isPending ? 'Бронюємо...' : 'Підтвердити бронювання'}
      </button>
    </form>
  );
}
