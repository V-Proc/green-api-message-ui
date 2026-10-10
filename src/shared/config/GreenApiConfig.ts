import type { InstanceCredentials } from '@/shared/api/Types';

export const API_URL = 'https://api.green-api.com';

export const MAX_MESSAGE_LENGTH = 4000;

export const POLLING_INTERVAL_MS = 3000;

export const RECEIVE_TIMEOUT_SECONDS = 10;

export const GREEN_API_METHODS = {
  sendMessage: 'sendMessage',
  receiveNotification: 'receiveNotification',
  deleteNotification: 'deleteNotification',
} as const;

export const emptyCredentials: InstanceCredentials = {
  idInstance: '',
  apiTokenInstance: '',
};