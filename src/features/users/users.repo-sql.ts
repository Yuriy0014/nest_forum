import { Injectable } from '@nestjs/common';
import { UserCreateModel } from './models/users.models.mongo';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserDBModel } from './models/users.models.sql';
import { UserObjectFromRawData } from './helpers/map-rawsql-to-object';

@Injectable()
export class UsersRepoSQL {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly rawSqlToObject: UserObjectFromRawData,
  ) {}

  async createUser(createDTO: UserCreateModel): Promise<string> {
    const id = uuidv4();
    await this.dataSource.query(
      `
    INSERT INTO public.users(
    "id",
    "login", "email", "password", "createdAt", 
    "emailConfirmationCode", "confirmationCodeExpDate", 
    "isEmailConfirmed", "passwordRecoveryCode", "passwordRecoveryCodeActive")
VALUES ($1, $2, $3, $4, $5, $6, $7, false, '', $8);
    `,
      [
        id,
        createDTO.login,
        createDTO.email,
        createDTO.passwordHash,
        new Date(),
        uuidv4(),
        add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
        createDTO.isAuthorSuper,
      ],
    );

    return id;
  }

  async findUserById(UserId: string): Promise<UserDBModel | null> {
    const foundUser: UserDBModel = await this.dataSource.query(
      `
        SELECT u."id", u."login", u."email", u."password",
         u."createdAt", u."emailConfirmationCode", u."confirmationCodeExpDate",
          u."isEmailConfirmed", u."passwordRecoveryCode", u."passwordRecoveryCodeActive"
        FROM public."users" u
        WHERE (u."id" = $1)`,
      [UserId],
    );
    if (foundUser[0]) {
      return foundUser[0];
    } else {
      return null;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    await this.dataSource.query(
      `
        DELETE FROM public.users
        WHERE id = $1`,
      [userId],
    );

    const deletedUser = await this.dataSource.query(
      `
        SELECT u."id"
        FROM public."users" u
        WHERE u."id" = $1`,
      [userId],
    );

    return deletedUser.length === 0;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDBModel | null> {
    const user = await this.dataSource.query(
      `
        SELECT u."id", u."login", u."email", u."password",
         u."createdAt", u."emailConfirmationCode", u."confirmationCodeExpDate",
          u."isEmailConfirmed", u."passwordRecoveryCode", u."passwordRecoveryCodeActive"
        FROM public."users" u
        WHERE (u."email" = $1 OR u."login" = $1)`,
      [loginOrEmail],
    );

    if (user.length !== 0) {
      return user[0];
    }
    return null;
  }

  async updateUserEmailConfirmationInfo(id: string): Promise<string> {
    const newCode = uuidv4();

    await this.dataSource.query(
      `
        UPDATE public.users
        SET "emailConfirmationCode"= $2, "confirmationCodeExpDate"=$3, "isEmailConfirmed"=false 
        WHERE "id" = $1 `,
      [
        id,
        newCode,
        add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
      ],
    );

    return newCode;
  }

  async findUserByConfirmationCode(code: string): Promise<UserDBModel | null> {
    const userRaw = await this.dataSource.query(
      `
        SELECT u."id", u."login", u."email", u."password",
         u."createdAt", u."emailConfirmationCode", u."confirmationCodeExpDate",
          u."isEmailConfirmed", u."passwordRecoveryCode", u."passwordRecoveryCodeActive"
        FROM public."users" u
        WHERE (u."emailConfirmationCode" = $1 )`,
      [code],
    );

    if (userRaw.length !== 0) {
      return this.rawSqlToObject.createUserFromRawData(userRaw);
    }
    return null;
  }

  async addPassRecoveryCode(
    id: string,
    passwordRecoveryCode: string,
  ): Promise<boolean> {
    const user = await this.dataSource.query(
      `
        SELECT u."id"
        FROM public."users" u
        WHERE (u."id" = $1 )`,
      [id],
    );
    if (!user) return false;

    await this.dataSource.query(
      `
        UPDATE public.users
        SET "passwordRecoveryCode" = $2,"passwordRecoveryCodeActive"=true 
        WHERE "id" = $1 `,
      [id, passwordRecoveryCode],
    );

    return true;
  }

  async findUserByPassRecoveryCode(recoveryCode: string) {
    const user = await this.dataSource.query(
      `
        SELECT u."id", u."login", u."email", u."password",
         u."createdAt", u."emailConfirmationCode", u."confirmationCodeExpDate",
          u."isEmailConfirmed", u."passwordRecoveryCode", u."passwordRecoveryCodeActive"
        FROM public."users" u
        WHERE (u."passwordRecoveryCode" = $1 )`,
      [recoveryCode],
    );

    if (user.length !== 0) {
      return user[0];
    }
    return null;
  }

  async confirmEmail(id: string): Promise<void> {
    await this.dataSource.query(
      `
        UPDATE public.users
        SET "isEmailConfirmed"=true 
        WHERE "id" = $1 `,
      [id],
    );
  }

  async updatePass(id: string, passwordHash: string) {
    await this.dataSource.query(
      `
        UPDATE public.users
        SET "password"= $2, "passwordRecoveryCodeActive" = false
        WHERE "id" = $1 `,
      [id, passwordHash],
    );
  }
}
