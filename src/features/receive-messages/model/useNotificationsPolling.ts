import { useEffect } from 'react';

import { POLLING_INTERVAL_MS } from '@/shared/config/GreenApiConfig';

import { useAppDispatch, useAppSelector } from '@/app/store/ReduxHooks';

import { fetchNotifications } from './fetchNotificationsThunk';
import { selectIsInstanceConnected } from './selectors';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useNotificationsPolling(): void {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(selectIsInstanceConnected);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    let isCancelled = false;

    const poll = async () => {
      while (!isCancelled) {
        const received: boolean = await dispatch(fetchNotifications()).unwrap();
        await delay(received ? POLLING_INTERVAL_MS / 3 : POLLING_INTERVAL_MS);
      }
    };

    void poll();

    return () => {
      isCancelled = true;
    };
  }, [isConnected, dispatch]);
}
