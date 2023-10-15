import mongoose from 'mongoose';

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

export type UserInputModel = {
  login: string;
  password: string;
  email: string;
};

export type UserCreateModel = {
  login: string;
  passwordHash: string;
  email: string;
  isAuthorSuper: boolean;
};
