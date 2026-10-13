import {
  GREEN_API_METHODS,
  RECEIVE_TIMEOUT_SECONDS,
} from '@/shared/config/GreenApiConfig';
import { GreenApiError } from '@/shared/lib/GreenApiError';

import type {
  GreenApiErrorPayload,
  InstanceCredentials,
  NotificationReceipt,
  SendMessageRequest,
  SendMessageResponse,
} from '@/shared/api/Types';

type HttpMethod = 'GET' | 'POST' | 'DELETE';

function buildUrl(
  credentials: InstanceCredentials,
  method: string,
  suffix = '',
  query = '',
): string {
  const { apiUrl, idInstance, apiTokenInstance } = credentials;

  if (!apiUrl || !idInstance || !apiTokenInstance) {
    throw new GreenApiError('Не заданы параметры подключения инстанса');
  }

  const base = apiUrl.replace(/\/+$/, '');
  const path = `/waInstance${idInstance}/${method}/${apiTokenInstance}${suffix}${query}`;
  const isDev = import.meta.env.DEV && import.meta.env.MODE !== 'test';

  if (isDev) {
    return `/green-api-proxy/${encodeURIComponent(base)}${path}`;
  }

  return `${base}${path}`;
}

async function request<T>(url: string, options: { method: HttpMethod; body?: string }): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: options.method,
      headers: options.body ? { 'Content-Type': 'application/json' } : {},
      body: options.body,
    });
  } catch (error) {
    console.error('[GreenApi] запрос не выполнен', url, error);

    throw new GreenApiError(
      'Нет соединения с сервером GREEN-API (проверьте apiUrl инстанса, сеть и консоль браузера на CORS)',
    );
  }

  const text = await response.text();

  if (!response.ok) {
    let message = `Ошибка запроса (${response.status})`;

    if (text) {
      try {
        message = ((JSON.parse(text) as GreenApiErrorPayload).error ?? message) || message;
      } catch {
        message = text;
      }
    }

    throw new GreenApiError(message, response.status);
  }

  if (!text) {
    return null as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GreenApiError('Некорректный ответ сервера (ожидался JSON)', response.status);
  }
}

const GreenApi = {
  sendMessage(credentials: InstanceCredentials, payload: SendMessageRequest): Promise<SendMessageResponse> {
    return request<SendMessageResponse>(buildUrl(credentials, GREEN_API_METHODS.sendMessage), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  receiveNotification(credentials: InstanceCredentials): Promise<NotificationReceipt | null> {
    return request<NotificationReceipt | null>(
      buildUrl(
        credentials,
        GREEN_API_METHODS.receiveNotification,
        '',
        `?receiveTimeout=${RECEIVE_TIMEOUT_SECONDS}`,
      ),
      { method: 'GET' },
    );
  },

  deleteNotification(credentials: InstanceCredentials, receiptId: number): Promise<{ result: boolean }> {
    return request<{ result: boolean }>(
      buildUrl(credentials, GREEN_API_METHODS.deleteNotification, `/${receiptId}`),
      { method: 'DELETE' },
    );
  },
};

export default GreenApi;
