import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class LoginInputDTO {
    @IsString()
    @Matches(/^\S+$/, {
        message: 'Title should not consist of whitespace characters',
    })
        loginOrEmail: string;

    @IsString()
    @Matches(/^\S+$/, {
        message: 'Title should not consist of whitespace characters',
    })
        password: string;
}

export class EmailResendInputModel {
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(50)
    @IsEmail()
        email: string;
}

export class EmailForPasswordRecoveryInputModel {
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(50)
    @IsEmail()
        email: string;
}

export class ConfirmationCodeInputModel {
    @IsNotEmpty()
    @Matches(/^\S+$/, {
        message: 'Title should not consist of whitespace characters',
    })
    @IsString()
        code: string;
}

export class NewPasswordInputModel {
    @IsString()
    @Matches(/^\S+$/, {
        message: 'Title should not consist of whitespace characters',
    })
    @MinLength(6)
    @MaxLength(20)
        newPassword: string;

    @IsString()
    @Matches(/^\S+$/, {
        message: 'Title should not consist of whitespace characters',
    })
        recoveryCode: string;
}

export type reqSessionDTOType = {
    loginIp: SessionIpModel;
    refreshTokenIssuedAt: number;
    deviceName: DeviceNameModel;
    userId: string;
    deviceId: string;
};

export type SessionIpModel = string;
export type DeviceNameModel = string;

export type SessionUpdateFilterModel = {
    RFTokenIAT: Date;
    deviceId: string;
    userId: string;
};

export type SessionViewModel = {
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;
};