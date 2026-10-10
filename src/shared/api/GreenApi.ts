import {
  API_URL,
  GREEN_API_METHODS,
  RECEIVE_TIMEOUT_SECONDS,
} from '@/shared/config/GreenApiConfig';
import type {
  GreenApiErrorPayload,
  InstanceCredentials,
  NotificationReceipt,
  SendMessageRequest,
  SendMessageResponse,
} from '@/shared/api/Types';
import { GreenApiError } from '@/shared/lib/GreenApiError';

type HttpMethod = 'GET' | 'POST' | 'DELETE';

function buildUrl(
  credentials: InstanceCredentials,
  method: string,
  suffix = '',
  query = '',
): string {
  const { idInstance, apiTokenInstance } = credentials;

  if (!idInstance || !apiTokenInstance) {
    throw new GreenApiError('Не заданы параметры подключения инстанса');
  }

  return `${API_URL}/waInstance${idInstance}/${method}/${apiTokenInstance}${suffix}${query}`;
}

async function request<T>(url: string, options: { method: HttpMethod; body?: string }): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: options.method,
      headers: { 'Content-Type': 'application/json' },
      body: options.body,
    });
  } catch {
    throw new GreenApiError('Нет соединения с сервером GREEN-API');
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as GreenApiErrorPayload | null;
    const message = payload?.error ?? `Ошибка запроса (${response.status})`;

    throw new GreenApiError(message, response.status);
  }

  return (await response.json()) as T;
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