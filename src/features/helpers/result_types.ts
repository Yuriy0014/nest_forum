export enum ResultCode {
  success,
  internalServerError,
  badRequest,
  incorrectEmail,
}

export type Result<T> = {
  resultCode: ResultCode;
  data: T | null;
  errorMessage?: string;
};
