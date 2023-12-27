import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UserDBModel {
    constructor(
        public id: string,
        public login: string,
        public email: string,
        public password: string,
        public createdAt: Date,
        public emailConfirmationCode: string,
        public confirmationCodeExpDate: Date,
        public isEmailConfirmed: boolean,
        public passwordRecoveryCode: string,
        public passwordRecoveryCodeActive: boolean,
    ) {
    }
 
    canBeConfirmed(code: string): boolean {
        return (
            !this.isEmailConfirmed &&
            this.emailConfirmationCode === code &&
            new Date(this.confirmationCodeExpDate) >= new Date()
        );
    }
}

export type UserViewModel = {
    id: string;
    login: string;
    email: string;
    createdAt: string;
};

export type UserCreateModel = {
    login: string;
    passwordHash: any;
    email: string;
    isAuthorSuper: boolean;
};

export class UserInputModel {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(10)
    @Matches(/^[a-zA-Z0-9_-]*$/)
        login: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    @Matches(/.*\S+.*/, {
        message: 'Title should not consist of whitespace characters',
    })
        password: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(50)
    @IsEmail()
        email: string;
}

export class SessionDBModel {
    constructor(
        public id: string,
        public ip: string,
        public title: string,
        public lastActiveDate: string,
        public deviceId: string,
        public deviceName: string,
        public userId: string,
        public RFTokenIAT: Date,
        public RFTokenObsoleteDate: Date,
    ) {
    }
}

export type SessionViewModel = {
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;
};
