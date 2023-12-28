import {UserDBModel} from '../models/users.models.sql';
import {Injectable} from '@nestjs/common';

@Injectable()
export class UserObjectFromRawData {
    createUserFromRawData(rawData: UserDBModel): UserDBModel {
        return new UserDBModel(
            rawData.id,
            rawData.login,
            rawData.email,
            rawData.password,
            new Date(rawData.createdAt),
            rawData.emailConfirmationCode,
            new Date(rawData.confirmationCodeExpDate),
            rawData.isEmailConfirmed,
            rawData.passwordRecoveryCode,
            rawData.passwordRecoveryCodeActive,
        );
    }
}
