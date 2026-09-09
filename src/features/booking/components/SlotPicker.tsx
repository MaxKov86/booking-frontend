'use client';

import { useAvailableSlots } from '../api';
import type { TimeSlot } from '../types';

const timeFormatter = new Intl.DateTimeFormat('uk-UA', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC', // бекенд віддає UTC; спрощення задокументоване в його README
});

interface SlotPickerProps {
  userId: string;
  date: string | null;
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
}

export function SlotPicker({ userId, date, selectedSlot, onSelect }: SlotPickerProps) {
  const { data: slots, isLoading, isError } = useAvailableSlots(userId, date);

  if (!date) {
    return <p className="text-sm text-muted">Спочатку оберіть дату</p>;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-md bg-surface-2" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-danger">Не вдалося завантажити доступні слоти</p>;
  }

  if (!slots || slots.length === 0) {
    return <p className="text-sm text-muted">На цю дату вільних слотів немає</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const isSelected = selectedSlot?.start === slot.start;

        return (
          <button
            key={slot.start}
            type="button"
            onClick={() => onSelect(slot)}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              isSelected
                ? 'border-brand bg-brand text-on-brand'
                : 'border-border bg-surface text-text hover:border-brand hover:text-brand'
            }`}
          >
            {timeFormatter.format(new Date(slot.start))}
          </button>
        );
      })}
    </div>
  );
}
