import request from 'supertest';

import sub from 'date-fns/sub';
import {HttpStatus, INestApplication} from '@nestjs/common';
import {
    UserInputModel,
} from '../../src/features/users/models/users.models.sql';
import {createTestAPP} from '../utils/createTestAPP';
import {RouterPaths} from '../../src/helpers/RouterPaths';
import {UsersRepoSQL} from '../../src/features/users/users.repo-sql';
import {DataSource} from 'typeorm';
import {UserEntity} from "../../src/features/users/entities/user.entities";

describe('/Testing auth', () => {
    let user1: UserEntity | null;
    let user2: UserEntity | null;
    let app: INestApplication;
    let server: any;
    let usersRepo: UsersRepoSQL;
    let dataSource: DataSource;

    beforeAll(async () => {
        app = await createTestAPP();
        server = app.getHttpServer();

        usersRepo = app.get(UsersRepoSQL);
        dataSource = app.get<DataSource>(DataSource);
    });

    it('Delete all data before tests', async () => {
        await request(server)
            .delete(`${RouterPaths.testing}/all-data`)
            .expect(HttpStatus.NO_CONTENT);
    });

    it('Registration 1', async () => {
        const data: UserInputModel = {
            login: 'Landau',
            password: 'LandauMIPT144',
            email: 'ylogachev-sfedu@mail.ru',
        };

        await request(server)
            .post(`${RouterPaths.auth}/registration`)
            .send(data)
            .expect(HttpStatus.NO_CONTENT);

        user1 = await usersRepo.findByLoginOrEmail(data.email);
        expect(user1).not.toBe(null);
        if (user1 !== null) {
            expect(user1.isEmailConfirmed).toBe(false);
            expect(typeof user1.emailConfirmationCode).toBe('string');
        }
    });

    it('Registration 2', async () => {
        const data: UserInputModel = {
            login: 'Landau_2',
            password: 'LandauSFEDU12',
            email: 'LandauSFEDU12@gmailya.com',
        };

        await request(server)
            .post(`${RouterPaths.auth}/registration`)
            .send(data)
            .expect(HttpStatus.NO_CONTENT);

        user2 = await usersRepo.findByLoginOrEmail(data.email);
        expect(user2).not.toBe(null);
        if (user2 !== null) {
            expect(user2.isEmailConfirmed).toBe(false);
            expect(typeof user2.emailConfirmationCode).toBe('string');
        }
    });

    it('Registration confirmation BAD 400 ', async () => {
        const dataConfirmationGood = {
            code: user1!.emailConfirmationCode,
        };

        const dataConfirmationBad1 = {
            code: user1!.emailConfirmationCode + 'h',
        };

        await request(server)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send(dataConfirmationBad1)
            .expect(HttpStatus.BAD_REQUEST);

        await dataSource.query(
            `UPDATE public.users
             SET "isEmailConfirmed"= TRUE
             WHERE id = $1;`,
            [user1!.id],
        );

        await request(server)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send(dataConfirmationGood)
            .expect(HttpStatus.BAD_REQUEST);

        await dataSource.query(
            `UPDATE public.users
             SET "isEmailConfirmed"= FALSE,
                 "confirmationCodeExpDate" = $2
             WHERE id = $1;`,
            [
                user1!.id,
                sub(new Date(), {
                    hours: 10,
                }),
            ],
        );

        await request(server)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send(dataConfirmationGood)
            .expect(HttpStatus.BAD_REQUEST);

        await dataSource.query(
            `UPDATE public.users
             SET "confirmationCodeExpDate"= $2
             WHERE id = $1;`,
            [user1!.id, user1!.confirmationCodeExpDate],
        );
    });

    it('Registration confirmation GOOD user 1 ', async () => {
        const dataConfirmation1 = {
            code: user1!.emailConfirmationCode,
        };

        await request(server)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send(dataConfirmation1)
            .expect(HttpStatus.NO_CONTENT);

        await request(server)
            .post(`${RouterPaths.auth}/registration-confirmation`)
            .send(dataConfirmation1)
            .expect(HttpStatus.BAD_REQUEST);

        user1 = await usersRepo.findByLoginOrEmail(user1!.email);
        expect(user1).not.toBe(null);
        if (user1 !== null) {
            expect(user1.isEmailConfirmed).toBe(true);
        }
    });

    it('Registration confirmation GOOD user 2 ', async () => {
        // Обернул в setTimeout чтоы не было 429
        setTimeout(async function () {
            const dataConfirmation1 = {
                code: user2!.emailConfirmationCode,
            };

            await request(server)
                .post(`${RouterPaths.auth}/registration-confirmation`)
                .send(dataConfirmation1)
                .expect(HttpStatus.NO_CONTENT);

            await request(server)
                .post(`${RouterPaths.auth}/registration-confirmation`)
                .send(dataConfirmation1)
                .expect(HttpStatus.BAD_REQUEST);

            user2 = await usersRepo.findByLoginOrEmail(user2!.email);
            expect(user2).not.toBe(null);
            if (user2 !== null) {
                expect(user2.isEmailConfirmed).toBe(true);
            }
        }, 2000);
    });

    it('should send email with code', async () => {
        const data = {
            email: user1!.email,
        };

        await request(server)
            .post(`${RouterPaths.auth}/password-recovery`)
            .send(data)
            .expect(HttpStatus.NO_CONTENT);
    });

    it('should return error if password is incorrect; status 400;', async () => {
        setTimeout(async function () {
            const userDB: UserEntity | null = await usersRepo.findByLoginOrEmail(
                user2!.email,
            );
            const data = {
                newPassword: 'short',
                recoveryCode: userDB!.passwordRecoveryCode,
            };

            await request(server)
                .post(`${RouterPaths.auth}/new-password`)
                .send(data)
                .expect(HttpStatus.BAD_REQUEST);
        }, 2000);
    });

    it('should update password;', async () => {
        setTimeout(async function () {
            let userDB: UserEntity | null = await usersRepo.findByLoginOrEmail(
                user2!.email,
            );
            const data = {
                newPassword: 'new_password',
                recoveryCode: userDB!.passwordRecoveryCode,
            };

            const old_pass = userDB!.password;
            await request(server)
                .post(`${RouterPaths.auth}/new-password`)
                .send(data)
                .expect(HttpStatus.NO_CONTENT);

            userDB = await usersRepo.findByLoginOrEmail(user2!.email);
            expect(userDB!.password === old_pass).toBe(false);
            expect(userDB!.passwordRecoveryCodeActive).toBe(false);
        }, 2000);
    });

    afterAll(async () => {
        await app.close();
    });
});
