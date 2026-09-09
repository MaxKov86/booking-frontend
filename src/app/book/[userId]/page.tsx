import { BookingFlow } from '@/features/booking/components/BookingFlow';

/**
 * Динамічний роут за userId. У ТЗ згадувався публічний slug
 * (/book/john-doe) — це "level up" фіча: потребує окремого бекенд-роуту
 * пошуку користувача за slug. Наразі використовуємо ObjectId напряму,
 * що функціонально те саме, просто URL менш красивий.
 */
export default async function BookPage({ params }: PageProps<'/book/[userId]'>) {
  const { userId } = await params;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Забронювати зустріч</h1>
        <p className="mt-1 text-sm text-muted">Оберіть зручні дату та час</p>
      </header>

      <BookingFlow userId={userId} />
    </main>
  );
}
