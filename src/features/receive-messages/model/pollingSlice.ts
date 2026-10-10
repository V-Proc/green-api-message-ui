import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PollingState {
  lastError: string | null;
}

const initialState: PollingState = {
  lastError: null,
};

const pollingSlice = createSlice({
  name: 'polling',
  initialState,
  reducers: {
    setPollingError(state, action: PayloadAction<string | null>) {
      state.lastError = action.payload;
    },
  },
});

export const { setPollingError } = pollingSlice.actions;
export default pollingSlice.reducer;