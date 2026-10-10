import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

const selectConnectionState = (state: RootState) => state.connection;

export const selectIsConnected = createSelector(
  [selectConnectionState],
  (connection) => connection.isConnected,
);

export const selectCredentials = createSelector(
  [selectConnectionState],
  ({ idInstance, apiTokenInstance }) => ({ idInstance, apiTokenInstance }),
);

export const selectConnectionError = createSelector(
  [selectConnectionState],
  (connection) => connection.error,
);