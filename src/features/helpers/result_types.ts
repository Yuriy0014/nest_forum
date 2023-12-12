enum ResultCode {
  success,
  internalServerError,
  badRequest,
  incorrectEmail,
}

type Result<T> = {
  resultCode: ResultCode;
  data: T | null;
  errorMessage?: string;
};
