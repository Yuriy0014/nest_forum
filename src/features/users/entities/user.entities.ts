import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class UserEntity {
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


    canBeConfirmed(code: string): boolean {
        return (
            !this.isEmailConfirmed &&
            this.emailConfirmationCode === code &&
            new Date(this.confirmationCodeExpDate) >= new Date()
        );
    }
}
