import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

export const selectPollingError = createSelector(
  [(state: RootState) => state.polling],
  (polling) => polling.lastError,
);

export const selectIsInstanceConnected = createSelector(
  [(state: RootState) => state.connection],
  (connection) => connection.isConnected,
);