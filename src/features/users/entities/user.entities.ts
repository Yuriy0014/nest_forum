import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column()
        login: string;

    @Column()
        email: string;

    @Column()
        password: string;

    @Column()
        createdAt: Date;

    @Column()
        emailConfirmationCode: string;

    @Column()
        confirmationCodeExpDate: Date;

    @Column()
        isEmailConfirmed: boolean;

    @Column()
        passwordRecoveryCode: string;

    @Column()
        passwordRecoveryCodeActive: boolean;
}
