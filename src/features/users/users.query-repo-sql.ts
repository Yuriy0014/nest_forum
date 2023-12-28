import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {MapUserViewModelSQL} from './helpers/map-UserViewModel-sql';
import {UserViewModel} from './models/users.models.sql';
import {UserFilterModel} from './helpers/filter';
import {UserEntity} from "./entities/user.entities";


@Injectable()
export class UsersQueryRepoSQL {
    constructor(
        private readonly mapUserViewModelSQL: MapUserViewModelSQL,
        @InjectDataSource() protected dataSource: DataSource
    ) {
    }

    async FindAllUsers(queryFilter: UserFilterModel) {
        // Защита от SqlInjection
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

        const email_like =
            queryFilter.searchEmailTerm === null
                ? '%'
                : `%${queryFilter.searchEmailTerm}%`;

        const orderByClause =
            '"' + queryFilter.sortBy + '"' + ' ' + queryFilter.sortDirection;


        const rawUsers = await this.dataSource
            .getRepository(UserEntity)
            .createQueryBuilder("u")
            .select([
                "u.id",
                "u.login",
                "u.email",
                "u.password",
                "u.createdAt",
                "u.emailConfirmationCode",
                "u.confirmationCodeExpDate",
                "u.isEmailConfirmed",
                "u.passwordRecoveryCode",
                "u.passwordRecoveryCodeActive"
            ])
            .where("u.login ILIKE :login OR u.email ILIKE :email", {login: `%${login_like}%`, email: `%${email_like}%`})
            .orderBy(orderByClause)
            .take(queryFilter.pageSize)
            .skip(queryFilter.pageSize * (queryFilter.pageNumber - 1))
            .getMany();

        const foundUsers = rawUsers.map((user) =>
            this.mapUserViewModelSQL.getUserViewModel(user),
        );

        const totalUsers = await this.dataSource
            .getRepository(UserEntity)
            .createQueryBuilder("u")
            .select("u.id")
            .where("u.login ILIKE :login OR u.email ILIKE :email", {login: `%${login_like}%`, email: `%${email_like}%`})
            .orderBy(orderByClause) //
            .getMany();

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

        const user = await this.dataSource
            .getRepository(UserEntity)
            .createQueryBuilder("u")
            .select([
                "u.id",
                "u.login",
                "u.email",
                "u.password",
                "u.createdAt",
                "u.emailConfirmationCode",
                "u.confirmationCodeExpDate",
                "u.isEmailConfirmed",
                "u.passwordRecoveryCode",
                "u.passwordRecoveryCodeActive"
            ])
            .where("u.login = :loginOrEmail OR u.email = :loginOrEmail", {loginOrEmail})
            .getOne()


        if (user) {
            return this.mapUserViewModelSQL.getUserViewModel(user);
        }
        return null;
    }

    async findUserById(id: string) {
        const user = await this.dataSource
            .getRepository(UserEntity)
            .createQueryBuilder("u")
            .select([
                "u.id",
                "u.login",
                "u.email",
                "u.password",
                "u.createdAt",
                "u.emailConfirmationCode",
                "u.confirmationCodeExpDate",
                "u.isEmailConfirmed",
                "u.passwordRecoveryCode",
                "u.passwordRecoveryCodeActive"
            ])
            .where("u.id = :id", {id})
            .getOne()
        if (user) {
            return this.mapUserViewModelSQL.getUserViewModel(user);
        } else {
            return null;
        }
    }
}
