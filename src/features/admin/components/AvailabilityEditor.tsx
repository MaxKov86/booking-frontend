'use client';

import { useState, type FormEvent } from 'react';
import { useMyAvailability, useUpdateAvailability } from '../api';
import type { WorkingHoursWindow } from '@/features/booking/types';

const DAY_LABELS = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';

const inputClassName =
  'rounded-md border border-border bg-surface px-2 py-1.5 text-sm focus:border-brand focus:outline-none';

export function AvailabilityEditor() {
  const { data: availability, isLoading } = useMyAvailability();
  const updateAvailability = useUpdateAvailability();

  const [slotDuration, setSlotDuration] = useState(30);
  const [buffer, setBuffer] = useState(0);
  const [minNotice, setMinNotice] = useState(2);
  const [workingHours, setWorkingHours] = useState<WorkingHoursWindow[]>([]);
  const [savedMessage, setSavedMessage] = useState(false);

  /**
   * Заповнюємо форму, коли прийшли дані з сервера — патерн "adjusting
   * state during render" (офіційна рекомендація React), а не useEffect.
   * setState в ефекті спричиняв би зайвий каскадний рендер: спочатку
   * рендер зі старими значеннями, потім ефект, потім ще один рендер.
   *
   * Якщо розкладу ще немає (404 для нового користувача) — лишаються
   * дефолти зі стану вище.
   */
  const [syncedAvailability, setSyncedAvailability] = useState(availability);
  if (availability && availability !== syncedAvailability) {
    setSyncedAvailability(availability);
    setSlotDuration(availability.slotDurationMinutes);
    setBuffer(availability.bufferMinutes ?? 0);
    setMinNotice(availability.minNoticeHours ?? 2);
    setWorkingHours(availability.workingHours);
  }

  function toggleDay(dayOfWeek: number) {
    setWorkingHours((prev) => {
      const exists = prev.some((wh) => wh.dayOfWeek === dayOfWeek);
      if (exists) {
        return prev.filter((wh) => wh.dayOfWeek !== dayOfWeek);
      }
      return [...prev, { dayOfWeek, startTime: DEFAULT_START, endTime: DEFAULT_END }].sort(
        (a, b) => a.dayOfWeek - b.dayOfWeek
      );
    });
  }

  function updateDayTime(dayOfWeek: number, field: 'startTime' | 'endTime', value: string) {
    setWorkingHours((prev) =>
      prev.map((wh) => (wh.dayOfWeek === dayOfWeek ? { ...wh, [field]: value } : wh))
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSavedMessage(false);

    await updateAvailability.mutateAsync({
      slotDurationMinutes: slotDuration,
      bufferMinutes: buffer,
      minNoticeHours: minNotice,
      workingHours,
    });

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  }

  if (isLoading) {
    return <p className="text-sm text-muted">Завантаження розкладу...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Робочі дні та години</h3>
        <div className="space-y-2">
          {DAY_LABELS.map((label, dayOfWeek) => {
            const dayConfig = workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
            const isEnabled = Boolean(dayConfig);

            return (
              <div key={dayOfWeek} className="flex items-center gap-3">
                <label className="flex w-20 shrink-0 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleDay(dayOfWeek)}
                    className="h-4 w-4 accent-[var(--color-brand)]"
                  />
                  {label}
                </label>

                {isEnabled && dayConfig && (
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="time"
                      value={dayConfig.startTime}
                      onChange={(e) => updateDayTime(dayOfWeek, 'startTime', e.target.value)}
                      className={inputClassName}
                    />
                    <span className="text-muted">—</span>
                    <input
                      type="time"
                      value={dayConfig.endTime}
                      onChange={(e) => updateDayTime(dayOfWeek, 'endTime', e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="slotDuration">
            Тривалість слоту (хв)
          </label>
          <input
            id="slotDuration"
            type="number"
            min={5}
            step={5}
            value={slotDuration}
            onChange={(e) => setSlotDuration(Number(e.target.value))}
            className={`${inputClassName} w-full`}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="buffer">
            Буфер між слотами (хв)
          </label>
          <input
            id="buffer"
            type="number"
            min={0}
            step={5}
            value={buffer}
            onChange={(e) => setBuffer(Number(e.target.value))}
            className={`${inputClassName} w-full`}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="minNotice">
            Мін. час наперед (год)
          </label>
          <input
            id="minNotice"
            type="number"
            min={0}
            value={minNotice}
            onChange={(e) => setMinNotice(Number(e.target.value))}
            className={`${inputClassName} w-full`}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={updateAvailability.isPending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          {updateAvailability.isPending ? 'Збереження...' : 'Зберегти розклад'}
        </button>

        {savedMessage && <span className="text-sm text-success">Збережено</span>}
        {updateAvailability.isError && (
          <span className="text-sm text-danger">Не вдалося зберегти</span>
        )}
      </div>
    </form>
  );
}
