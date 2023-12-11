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
    const validSortFields = [
      'id',
      'login',
      'email',
      'createdAt',
      'confirmationCodeExpDate',
      'isEmailConfirmed',
      'passwordRecoveryCodeActive',
    ];
    if (!validSortFields.includes(queryFilter.sortBy)) {
      throw new Error('Invalid sort field');
    }

    const login_like =
      queryFilter.searchLoginTerm === null
        ? '%'
        : `%${queryFilter.searchLoginTerm}%`;
    console.log(login_like);

    const email_like =
      queryFilter.searchEmailTerm === null
        ? '%'
        : `%${queryFilter.searchEmailTerm}%`;

    console.log(email_like);

    const orderByClause =
      '"' + queryFilter.sortBy + '"' + ' ' + queryFilter.sortDirection;

    console.log(orderByClause);

    const rawUsers = await this.dataSource.query(
      `
        SELECT u."id", u."login", u."email", u."password",
         u."createdAt", u."emailConfirmationCode", u."confirmationCodeExpDate",
          u."isEmailConfirmed", u."passwordRecoveryCode", u."passwordRecoveryCodeActive"
        FROM public."users" u
        WHERE ("login" ILIKE $1 OR "email" ILIKE $2)
        ORDER BY ${orderByClause}
        LIMIT $3
        OFFSET $4;
        `,
      [
        login_like,
        email_like,
        queryFilter.pageSize,
        queryFilter.pageSize * (queryFilter.pageNumber - 1),
      ],
    );

    console.log(rawUsers);

    const foundUsers = rawUsers.map((user) =>
      this.mapUserViewModelSQL.getUserViewModel(user),
    );

    const totalUsers = await this.dataSource.query(
      `
        SELECT u."id"
        FROM public."users" u
        WHERE ("login" ILIKE $1 OR "email" ILIKE $2)
        ORDER BY ${orderByClause}
        `,
      [login_like, email_like],
    );

    const totalCount = totalUsers.length;

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
    if (user[0]) {
      return this.mapUserViewModelSQL.getUserViewModel(user[0]);
    } else {
      return null;
    }
  }
}
