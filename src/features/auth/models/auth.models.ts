import mongoose from 'mongoose';
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

/////////////////
// Sessions
////////////////

export class SessionDBModel {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public ip: SessionIpModel,
    public title: string,
    public lastActiveDate: string,
    public deviceId: string,
    public deviceName: DeviceNameModel,
    public userId: string,
    public RFTokenIAT: Date,
    public RFTokenObsoleteDate: Date,
  ) {}
}

export type reqSessionDTOType = {
  loginIp: SessionIpModel;
  refreshTokenIssuedAt: number;
  deviceName: DeviceNameModel;
  userId: string;
  deviceId: string;
};

export type SessionIpModel = string | string[];
export type DeviceNameModel = string | string[];

export type SessionViewModel = {
  ip: SessionIpModel;
  title: string;
  lastActiveDate: string;
  deviceId: string;
};

export type SessionUpdateFilterModel = {
  RFTokenIAT: Date;
  deviceId: string;
  userId: string;
};

export type SessionUpdateContentModel = {
  ip: SessionIpModel;
  lastActiveDate: string;
  RFTokenIAT: Date;
  deviceName: DeviceNameModel;
  RFTokenObsoleteDate: Date;
};
