import { afterEach, describe, expect, it } from 'vitest';

import { createTestStore } from '@/shared/lib/TestUtils';

import { connect, disconnect, setConnectionError } from '@/features/instance-connection';

afterEach(() => {
  localStorage.clear();
});

describe('connectionSlice', () => {
  it('connect сохраняет креденшалы и подключает', () => {
    const store = createTestStore();

    store.dispatch(connect({ idInstance: '111', apiTokenInstance: 'aaa' }));

    const { connection } = store.getState();

    expect(connection.isConnected).toBe(true);
    expect(connection.idInstance).toBe('111');
    expect(connection.apiTokenInstance).toBe('aaa');
    expect(connection.error).toBeNull();
  });

  it('disconnect сбрасывает подключение и удаляет сохранённые креденшалы', () => {
    localStorage.setItem('green-api-credentials', JSON.stringify({ idInstance: '111' }));
    const store = createTestStore();

    store.dispatch(connect({ idInstance: '111', apiTokenInstance: 'aaa' }));
    store.dispatch(disconnect());

    expect(store.getState().connection.isConnected).toBe(false);
    expect(localStorage.getItem('green-api-credentials')).toBeNull();
  });

  it('setConnectionError сохранляет текст ошибки', () => {
    const store = createTestStore();

    store.dispatch(setConnectionError('Сетевой сбой'));

    expect(store.getState().connection.error).toBe('Сетевой сбой');
  });

  it('connect очищает предыдущую ошибку', () => {
    const store = createTestStore();

    store.dispatch(setConnectionError('Сетевой сбой'));
    store.dispatch(connect({ idInstance: '111', apiTokenInstance: 'aaa' }));

    expect(store.getState().connection.error).toBeNull();
  });
});
