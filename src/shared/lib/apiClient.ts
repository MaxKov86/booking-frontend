const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * Кастомний клас помилки — щоб компоненти могли розрізняти "мережа
 * впала" від "сервер відповів 409, бо слот зайняли". Звичайний Error
 * не ніс би статус-код, і UI не міг би показати різні повідомлення.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  /** JWT для захищених роутів — додається як Authorization: Bearer */
  token?: string | null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    // Бекенд віддає { message: "..." } на помилках — намагаємось дістати
    // це повідомлення; якщо тіло не JSON (напр. 502 від проксі), падаємо
    // на загальний текст, а не кидаємо помилку парсингу поверх помилки HTTP
    let message = `Помилка запиту (${response.status})`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // тіло не JSON — лишаємо дефолтне повідомлення
    }
    throw new ApiError(response.status, message);
  }

  // 204 No Content не має тіла — response.json() на ньому впаде
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
