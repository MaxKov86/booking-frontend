import { BookingFlow } from '@/features/booking/components/BookingFlow';

/**
 * Динамічний роут за userId. У ТЗ згадувався публічний slug
 * (/book/john-doe) — це "level up" фіча: потребує окремого бекенд-роуту
 * пошуку користувача за slug. Наразі використовуємо ObjectId напряму,
 * що функціонально те саме, просто URL менш красивий.
 *
 * Заголовок сторінки живе у BookingFlow, а не тут — бо він залежить
 * від даних (назва послуги, ім'я спеціаліста), які завантажуються
 * на клієнті. Дублювати статичний заголовок тут означало б показувати
 * два різні заголовки один під одним.
 */
export default async function BookPage({ params }: PageProps<'/book/[userId]'>) {
  const { userId } = await params;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <BookingFlow userId={userId} />
    </main>
  );
}
