import Link from 'next/link';

/**
 * Лендинг для СПЕЦІАЛІСТІВ — саме вони аудиторія кореневої сторінки.
 *
 * Клієнти сюди не заходять взагалі: вони потрапляють одразу на
 * /book/:userId за персональним посиланням, яке спеціаліст роздає сам
 * (підпис у листі, соцмережі, візитка). Це модель Calendly — немає
 * спільного каталогу чи пошуку, кожен спеціаліст володіє своїм
 * посиланням.
 *
 * Server Component (без 'use client') — жодної інтерактивності тут
 * немає, тільки статичний контент і навігація. Анімації — чистий CSS
 * (див. globals.css), тому клієнтський JS не потрібен.
 */

const STEPS = [
  {
    title: 'Зареєструйтесь',
    description: 'Створіть акаунт — це займе менше хвилини.',
  },
  {
    title: 'Налаштуйте розклад',
    description:
      'Вкажіть, що пропонуєте, у які дні працюєте й скільки триває зустріч. Система сама порахує вільні слоти.',
  },
  {
    title: 'Поділіться посиланням',
    description:
      'Отримайте персональне посилання й надішліть клієнтам. Вони оберуть вільний час — ви отримаєте сповіщення.',
  },
];

const FEATURES = [
  {
    title: 'Без подвійних записів',
    description:
      'Щойно слот зайнято, він миттєво зникає у всіх, хто дивиться сторінку. Два клієнти фізично не можуть забронювати один час.',
  },
  {
    title: 'Ваші правила',
    description:
      'Тривалість зустрічі, перерви між ними, за скільки годин наперед можна записатись — усе налаштовується.',
  },
  {
    title: 'Клієнту не треба реєструватись',
    description:
      'Він просто відкриває посилання, обирає час і лишає контакти. Жодних акаунтів і паролів.',
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <section className="animate-fade-in-up">
        {/* text-balance розподіляє слова по рядках рівномірно, уникаючи
            "висячого" одного слова на другому рядку. text-nowrap на
            десктопі (lg+) тримає заголовок в один рядок, на вужчих
            екранах дозволяємо перенос — інакше текст вилазив би за межі */}
        <h1 className="text-4xl font-semibold tracking-tight text-balance lg:whitespace-nowrap lg:text-[2.75rem]">
          Плануйте зустрічі без листування
        </h1>
        <p className="mt-4 text-lg text-muted">
          Поділіться персональним посиланням — клієнти самі оберуть вільний час у вашому розкладі.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/admin"
            className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-on-brand transition-all hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20"
          >
            Почати безкоштовно
          </Link>
          {/* Вторинна кнопка — тепер з видимою межею, а не просто текст:
              раніше вона губилась поруч із залитою основною */}
          <Link
            href="/admin"
            className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
          >
            У мене вже є акаунт
          </Link>
        </div>
      </section>

      <section className="animate-fade-in-up animate-delay-1 mt-20">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Як це працює</h2>

        <ol className="mt-6 space-y-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                {index + 1}
              </span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="animate-fade-in-up animate-delay-2 mt-20 grid gap-6 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-brand-soft hover:shadow-md"
          >
            <h3 className="text-sm font-medium">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted">{feature.description}</p>
          </div>
        ))}
      </section>

      <footer className="animate-fade-in-up animate-delay-3 mt-20 border-t border-border pt-8 text-sm text-muted">
        <p>
          Демо-проект для портфоліо.{' '}
          <Link href="/admin" className="text-brand transition-colors hover:text-brand-hover">
            Спробувати
          </Link>
        </p>
      </footer>
    </main>
  );
}
