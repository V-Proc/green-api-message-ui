export class GreenApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'GreenApiError';
    this.status = status;
  }
}