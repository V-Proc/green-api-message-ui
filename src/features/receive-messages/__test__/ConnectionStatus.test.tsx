import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createTestStore } from '@/shared/lib/TestUtils';

import { connect, setConnectionError } from '@/features/instance-connection';
import { ConnectionStatus } from '@/features/receive-messages';
import { setPollingError } from '@/features/receive-messages';

import type { ReactElement } from 'react';

function renderStatus(ui: ReactElement, store: ReturnType<typeof createTestStore>) {
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('ConnectionStatus', () => {
  it('не рендерится, пока инстанс не подключён', () => {
    const store = createTestStore();
    store.dispatch(setPollingError('Сетевой сбой'));

    const { container } = renderStatus(<ConnectionStatus />, store);

    expect(container).toBeEmptyDOMElement();
  });

  it('показывает статус получения при подключении', () => {
    const store = createTestStore();
    store.dispatch(connect({ apiUrl: 'https://api.green-api.com', idInstance: '111', apiTokenInstance: 'aaa' }));

    renderStatus(<ConnectionStatus />, store);

    expect(screen.getByText('Получение сообщений')).toBeInTheDocument();
  });

  it('показывает текст ошибки polling', () => {
    const store = createTestStore();
    store.dispatch(connect({ apiUrl: 'https://api.green-api.com', idInstance: '111', apiTokenInstance: 'aaa' }));
    store.dispatch(setPollingError('Сетевой сбой'));

    renderStatus(<ConnectionStatus />, store);

    expect(screen.getByText('Сетевой сбой')).toBeInTheDocument();
  });

  it('setConnectionError из connectionSlice не отображается как ошибка polling', () => {
    const store = createTestStore();
    store.dispatch(connect({ apiUrl: 'https://api.green-api.com', idInstance: '111', apiTokenInstance: 'aaa' }));
    store.dispatch(setConnectionError('Другая ошибка'));

    renderStatus(<ConnectionStatus />, store);

    expect(screen.getByText('Получение сообщений')).toBeInTheDocument();
  });
});
