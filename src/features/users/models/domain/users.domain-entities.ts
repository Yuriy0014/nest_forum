import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { UserCreateModel } from '../users.models';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';

@Schema()
class AccountData {
  @Prop({
    required: true,
  })
  login: string;
  @Prop({
    required: true,
  })
  email: string;
  @Prop({
    required: true,
  })
  password: string;
  @Prop({
    required: true,
  })
  createdAt: string;
}

@Schema()
class EmailConfirmation {
  @Prop({
    required: true,
  })
  confirmationCode: string;
  @Prop({
    required: true,
  })
  expirationDate: string;
  @Prop({
    required: true,
  })
  isConfirmed: boolean;
}

@Schema()
class PasswordRecovery {
  @Prop()
  passwordRecoveryCode: string;
  @Prop({
    required: true,
  })
  active: boolean;
}

export const AccountDataSchema = SchemaFactory.createForClass(AccountData);
export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);

@Schema()
export class User {
  _id: mongoose.Types.ObjectId;
  @Prop({
    required: true,
    type: AccountDataSchema,
  })
  accountData: AccountData;
  @Prop({
    required: true,
    type: EmailConfirmationSchema,
  })
  emailConfirmation: EmailConfirmation;
  //
  @Prop({
    required: true,
    type: PasswordRecoverySchema,
  })
  passwordRecovery: PasswordRecovery;

  static createUser(
    dto: UserCreateModel,
    userModel: UserModelType,
  ): UserDocument {
    const userInstance = new userModel();
    userInstance._id = new mongoose.Types.ObjectId();
    userInstance.accountData = {
      login: dto.login,
      email: dto.email,
      password: dto.passwordHash,
      createdAt: new Date().toISOString(),
    };
    userInstance.emailConfirmation = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 3,
      }).toISOString(),
      isConfirmed: false,
    };
    userInstance.passwordRecovery = {
      passwordRecoveryCode: '',
      active: dto.isAuthorSuper,
    };

    return userInstance;
  }
}
export type UserModelType = Model<User> & UserModelStaticType;
export const UserSchema = SchemaFactory.createForClass(User);

export type UserModelStaticType = {
  createUser: (dto: UserCreateModel, UserModel: UserModelType) => any;
};

const UserStaticMethods: UserModelStaticType = {
  createUser: User.createUser,
};

UserSchema.statics = UserStaticMethods;

export type UserDocument = HydratedDocument<User>;
