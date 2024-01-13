import {HttpStatus} from "@nestjs/common";

export type Result<T> = {
  resultCode: HttpStatus;
  data: T | null;
  errorMessage?: string;
};
