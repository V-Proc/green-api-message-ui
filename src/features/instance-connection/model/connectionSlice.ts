import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_API_URL } from '@/shared/config/GreenApiConfig';

import type { InstanceCredentials } from '@/shared/api/Types';

interface ConnectionState extends InstanceCredentials {
  isConnected: boolean;
  error: string | null;
}

const STORAGE_KEY = 'green-api-credentials';

function readStoredCredentials(): InstanceCredentials {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { apiUrl: DEFAULT_API_URL, idInstance: '', apiTokenInstance: '' };
    }

    return JSON.parse(raw) as InstanceCredentials;
  } catch {
    return { apiUrl: DEFAULT_API_URL, idInstance: '', apiTokenInstance: '' };
  }
}

const initialState: ConnectionState = {
  ...readStoredCredentials(),
  isConnected: false,
  error: null,
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    connect(state, action: PayloadAction<InstanceCredentials>) {
      state.apiUrl = action.payload.apiUrl;
      state.idInstance = action.payload.idInstance;
      state.apiTokenInstance = action.payload.apiTokenInstance;
      state.isConnected = true;
      state.error = null;
    },
    disconnect(state) {
      state.isConnected = false;
      localStorage.removeItem(STORAGE_KEY);
    },
    setConnectionError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

export const { connect, disconnect, setConnectionError } = connectionSlice.actions;
export default connectionSlice.reducer;
