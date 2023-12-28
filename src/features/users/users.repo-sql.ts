import {Injectable} from '@nestjs/common';
import {UserCreateModel} from './models/users.models.mongo';
import {v4 as uuidv4} from 'uuid';
import add from 'date-fns/add';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {UserDBModel} from './models/users.models.sql';
import {UserObjectFromRawData} from './helpers/map-rawsql-to-object';
import {UserEntity} from "./entities/user.entities";

@Injectable()
export class UsersRepoSQL {
    constructor(
        @InjectDataSource() protected dataSource: DataSource,
        private readonly rawSqlToObject: UserObjectFromRawData,
    ) {
    }

    async createUser(createDTO: UserCreateModel): Promise<string> {
        const id = uuidv4();

        const user = new UserEntity();
        user.id = id;
        user.login = createDTO.login;
        user.email = createDTO.email;
        user.password = createDTO.passwordHash;
        user.createdAt = new Date();
        user.emailConfirmationCode = uuidv4();
        user.confirmationCodeExpDate = add(new Date(), {hours: 1, minutes: 3});
        user.isEmailConfirmed = false;
        user.passwordRecoveryCode = '';
        user.passwordRecoveryCodeActive = createDTO.isAuthorSuper;

        await this.dataSource.getRepository(UserEntity).save(user);

        return id;
    }

    async findUserById(UserId: string): Promise<UserDBModel | null> {

        const foundUser = await this.dataSource.getRepository(UserEntity)
            .createQueryBuilder("u")
            .select(["u.id",
                "u.login",
                "u.email",
                "u.password",
                "u.createdAt",
                "u.emailConfirmationCode",
                "u.confirmationCodeExpDate",
                "u.isEmailConfirmed",
                "u.passwordRecoveryCode",
                "u.passwordRecoveryCodeActive"])
            .where("u.id = :UserId", {UserId})
            .getOne()


        if (foundUser) {
            return foundUser;
        } else {
            return null;
        }
    }

    async deleteUser(userId: string): Promise<boolean> {
        await this.dataSource.getRepository(UserEntity).delete(userId);


        const deletedUser = await this.dataSource.getRepository(UserEntity).find({
            select: ["id"],
            where: {
                id: userId
            }
        });

        return deletedUser.length === 0;
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<UserDBModel | null> {
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

        return user;
    }

    async updateUserEmailConfirmationInfo(id: string): Promise<string> {
        const newCode = uuidv4();
        const newconfirmationCodeExpDate = add(new Date(), {
            hours: 1,
            minutes: 3,
        })

        await this.dataSource
            .createQueryBuilder()
            .update(UserEntity)
            .set({
                emailConfirmationCode: newCode,
                confirmationCodeExpDate: newconfirmationCodeExpDate,
                isEmailConfirmed: false
            })
            .where("id = :id", {id})
            .execute()

        return newCode;
    }

    async findUserByConfirmationCode(code: string): Promise<UserDBModel | null> {

        const userRaw = await this.dataSource
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
            .where("u.emailConfirmationCode = :code", {code})
            .getOne()


        if (userRaw) {
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
                WHERE (u."id" = $1)`,
            [id],
        );
        if (!user) return false;

        await this.dataSource.query(
            `
                UPDATE public.users
                SET "passwordRecoveryCode"      = $2,
                    "passwordRecoveryCodeActive"= TRUE
                WHERE "id" = $1 `,
            [id, passwordRecoveryCode],
        );

        return true;
    }

    async findUserByPassRecoveryCode(recoveryCode: string) {
        const user = await this.dataSource.query(
            `
                SELECT u."id",
                       u."login",
                       u."email",
                       u."password",
                       u."createdAt",
                       u."emailConfirmationCode",
                       u."confirmationCodeExpDate",
                       u."isEmailConfirmed",
                       u."passwordRecoveryCode",
                       u."passwordRecoveryCodeActive"
                FROM public."users" u
                WHERE (u."passwordRecoveryCode" = $1)`,
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
                SET "isEmailConfirmed"= TRUE
                WHERE "id" = $1 `,
            [id],
        );
    }

    async updatePass(id: string, passwordHash: string) {
        await this.dataSource.query(
            `
                UPDATE public.users
                SET "password"= $2,
                    "passwordRecoveryCodeActive" = FALSE
                WHERE "id" = $1 `,
            [id, passwordHash],
        );
    }
}
