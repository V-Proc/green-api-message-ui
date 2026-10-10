import { afterEach, describe, expect, it, vi } from 'vitest';
import GreenApi from '@/shared/api/GreenApi';
import { GreenApiError } from '@/shared/lib/GreenApiError';

const credentials = { idInstance: '1101234567', apiTokenInstance: 'token-abc' };
const BASE = 'https://api.green-api.com/waInstance1101234567';

function mockFetchResponse(body: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('GreenApi', () => {
  describe('sendMessage', () => {
    it('выполняет POST с корректным URL и телом, возвращает idMessage', async () => {
      mockFetchResponse({ idMessage: '1763115112345' });

      const result = await GreenApi.sendMessage(credentials, {
        chatId: '10000000',
        message: 'Привет!',
      });

      expect(result).toEqual({ idMessage: '1763115112345' });
      expect(fetch).toHaveBeenCalledWith(`${BASE}/sendMessage/token-abc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: '10000000', message: 'Привет!' }),
      });
    });

    it('возвращает GreenApiError с сообщением сервера при неуспешном ответе', async () => {
      mockFetchResponse({ error: 'Validation failed' }, false, 400);

      await expect(
        GreenApi.sendMessage(credentials, { chatId: '1', message: 'текст' }),
      ).rejects.toMatchObject({
        name: 'GreenApiError',
        message: 'Validation failed',
        status: 400,
      });
    });

    it('использует статус как сообщение, если сервер не вернул error', async () => {
      mockFetchResponse(null, false, 503);

      await expect(
        GreenApi.sendMessage(credentials, { chatId: '1', message: 'текст' }),
      ).rejects.toThrow('Ошибка запроса (503)');
    });

    it('бросает ошибку соединения при сетевом сбое', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

      await expect(
        GreenApi.sendMessage(credentials, { chatId: '1', message: 'текст' }),
      ).rejects.toThrow('Нет соединения с сервером GREEN-API');
    });

    it('бросает ошибку без запроса при незаполненных креденшалах', () => {
      vi.stubGlobal('fetch', vi.fn());

      expect(() =>
        GreenApi.sendMessage({ idInstance: '', apiTokenInstance: '' }, {
          chatId: '1',
          message: 'текст',
        }),
      ).toThrow('Не заданы параметры подключения инстанса');

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('receiveNotification', () => {
    it('выполняет GET с параметром receiveTimeout', async () => {
      mockFetchResponse(null, true, 200);

      await GreenApi.receiveNotification(credentials);

      expect(fetch).toHaveBeenCalledWith(`${BASE}/receiveNotification/token-abc?receiveTimeout=10`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
      });
    });

    it('возвращает null, когда очередь пуста (пустой ответ сервера)', async () => {
      mockFetchResponse(null, true, 200);

      const result = await GreenApi.receiveNotification(credentials);

      expect(result).toBeNull();
    });
  });

  describe('deleteNotification', () => {
    it('выполняет DELETE с receiptId в URL', async () => {
      mockFetchResponse({ result: true, reason: '' });

      const result = await GreenApi.deleteNotification(credentials, 1234567);

      expect(result).toEqual({ result: true, reason: '' });
      expect(fetch).toHaveBeenCalledWith(
        `${BASE}/deleteNotification/token-abc/1234567`,
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  it('GreenApiError хранит статус', () => {
    const error = new GreenApiError('oops', 418);

    expect(error).toBeInstanceOf(GreenApiError);
    expect(error.status).toBe(418);
  });
});