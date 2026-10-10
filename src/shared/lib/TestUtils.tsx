import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createAppStore } from '@/app/store';

export type TestStore = ReturnType<typeof createAppStore>;

export function createTestStore(): TestStore {
  return createAppStore();
}

export function renderWithStore(ui: ReactElement, store: TestStore = createTestStore()) {
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}