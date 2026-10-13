import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

import { createAppStore } from '@/app/store';

import type { ReactElement } from 'react';

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
