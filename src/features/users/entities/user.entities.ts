import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import {SessionEntity} from "../../auth/entities/sessions.entities";

@Entity({name: "users"})
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

    @OneToMany(() => SessionEntity, (session) => session.user)
        sessions: SessionEntity[]

    canBeConfirmed(code: string): boolean {
        return (
            !this.isEmailConfirmed &&
            this.emailConfirmationCode === code &&
            new Date(this.confirmationCodeExpDate) >= new Date()
        );
    }
}
