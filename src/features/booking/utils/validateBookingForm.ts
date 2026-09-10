export interface BookingFormValues {
  clientName: string;
  clientEmail: string;
  notes: string;
}

export type BookingFormErrors = Partial<Record<keyof BookingFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Дублює правила з бекенду (zod-схема в bookings.routes.ts) — навмисно.
 * Клієнтська валідація тут для UX (миттєвий фідбек без запиту), а не
 * для безпеки: бекенд однаково перевіряє все заново, бо клієнтську
 * перевірку легко обійти.
 */
export function validateBookingForm(values: BookingFormValues): BookingFormErrors {
  const errors: BookingFormErrors = {};

  const name = values.clientName.trim();
  if (!name) {
    errors.clientName = "Ім'я обов'язкове";
  } else if (name.length < 2) {
    errors.clientName = 'Мінімум 2 символи';
  }

  const email = values.clientEmail.trim();
  if (!email) {
    errors.clientEmail = "Email обов'язковий";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.clientEmail = 'Некоректний формат email';
  }

  if (values.notes.length > 1000) {
    errors.notes = 'Максимум 1000 символів';
  }

  return errors;
}
