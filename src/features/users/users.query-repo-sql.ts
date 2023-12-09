import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MapUserViewModelSQL } from './helpers/map-UserViewModel.sql';
import { UserViewModel } from './models/users.models.sql';
import { UserFilterModel } from './helpers/filter';

@Injectable()
export class UsersQueryRepoSQL {
  constructor(
    private readonly mapUserViewModelSQL: MapUserViewModelSQL,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async FindAllUsers(queryFilter: UserFilterModel) {
    console.log(
      '"' + queryFilter.sortBy + '"' + ' ' + queryFilter.sortDirection,
    );

    const rawUsers = await this.dataSource.query(
      `
        SELECT u."id", u."login", u."email", u."password",
         u."createdAt", u."emailConfirmationCode", u."confirmationCodeExpDate",
          u."isEmailConfirmed", u."passwordRecoveryCode", u."passwordRecoveryCodeActive"
        FROM public."users" u
        ORDER BY $1
        LIMIT $2
        OFFSET $3;
        `,
      [
        '"' + queryFilter.sortBy + '"' + ' ' + queryFilter.sortDirection,
        queryFilter.pageSize,
        queryFilter.pageSize * (queryFilter.pageNumber - 1),
      ],
    );

    const foundUsers = rawUsers.map((user) =>
      this.mapUserViewModelSQL.getUserViewModel(user),
    );

    const totalCount = foundUsers.length;

    return {
      pagesCount: Math.ceil(totalCount / queryFilter.pageSize),
      page: queryFilter.pageNumber,
      pageSize: queryFilter.pageSize,
      totalCount: totalCount,
      items: foundUsers,
    };
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserViewModel | null> {
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
      return this.mapUserViewModelSQL.getUserViewModel(user[0]);
    }
    return null;
  }

  async findUserById(id: string) {
    const user = await this.dataSource.query(
      `
        SELECT u."id", u."login", u."email", u."password",
         u."createdAt", u."emailConfirmationCode", u."confirmationCodeExpDate",
          u."isEmailConfirmed", u."passwordRecoveryCode", u."passwordRecoveryCodeActive"
        FROM public."users" u
        WHERE (u."id" = $1)`,
      [id],
    );
    if (user) {
      return this.mapUserViewModelSQL.getUserViewModel(user[0]);
    } else {
      return null;
    }
  }
}
