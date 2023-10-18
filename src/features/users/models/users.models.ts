import mongoose from 'mongoose';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserDBModel {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public accountData: accountDataModel,
    public emailConfirmation: emailConfirmationModel,
    public passwordRecovery: passwordRecoveryModel,
  ) {}
}

type accountDataModel = {
  login: string;
  email: string;
  password: string;
  createdAt: string;
};

type emailConfirmationModel = {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
};

type passwordRecoveryModel = {
  passwordRecoveryCode: string;
  active: boolean;
};

export type UsersWithPaginationModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UserViewModel[];
};

export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UserCreateModel = {
  login: string;
  passwordHash: any;
  email: string;
  isAuthorSuper: boolean;
};

export class UserInputModel {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  @IsEmail()
  email: string;
}
