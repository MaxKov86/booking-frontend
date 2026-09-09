/**
 * Типи свідомо ПРОДУБЛЬОВАНІ з бекенду, а не витягнуті зі спільного пакета —
 * фронтенд і бекенд це два окремі репозиторії (рішення з ТЗ). Для проекту
 * такого розміру shared-пакет додав би monorepo-тулінг, який ускладнює
 * запуск і деплой більше, ніж економить на дублюванні кількох інтерфейсів.
 */

export interface WorkingHoursWindow {
  dayOfWeek: number; // 0 = неділя, 6 = субота
  startTime: string; // "09:00"
  endTime: string;
}

export interface Availability {
  _id: string;
  userId: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  workingHours: WorkingHoursWindow[];
}

/** Слоти приходять з API як ISO-рядки, конвертація в Date — на рівні компонентів */
export interface TimeSlot {
  start: string;
  end: string;
}

export interface Booking {
  _id: string;
  userId: string;
  startsAt: string;
  endsAt: string;
  clientName: string;
  clientEmail: string;
  notes?: string;
  status: 'confirmed' | 'cancelled';
}

export interface CreateBookingInput {
  userId: string;
  startsAt: string;
  clientName: string;
  clientEmail: string;
  notes?: string;
}
