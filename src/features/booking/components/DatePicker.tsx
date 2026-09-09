'use client';

import { DayPicker } from 'react-day-picker';
import { uk } from 'date-fns/locale';
import type { Availability } from '../types';

interface DatePickerProps {
  availability: Availability;
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

export function DatePicker({ availability, selectedDate, onSelect }: DatePickerProps) {
  // Дні тижня, у які спеціаліст взагалі не працює — вимикаємо в календарі,
  // щоб користувач не клікав по них марно й не бачив порожній список слотів
  const workingDays = new Set(availability.workingHours.map((wh) => wh.dayOfWeek));
  const nonWorkingDays = [0, 1, 2, 3, 4, 5, 6].filter((day) => !workingDays.has(day));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <DayPicker
      mode="single"
      locale={uk}
      selected={selectedDate}
      onSelect={onSelect}
      disabled={[
        { before: today }, // минулі дати
        { dayOfWeek: nonWorkingDays },
      ]}
      className="rdp-root"
    />
  );
}
