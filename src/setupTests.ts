import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

Element.prototype.scrollIntoView = () => {};

if (typeof crypto.randomUUID !== 'function') {
  Object.defineProperty(crypto, 'randomUUID', {
    value: () => `test-uuid-${Math.random().toString(36).slice(2)}`,
  });
}