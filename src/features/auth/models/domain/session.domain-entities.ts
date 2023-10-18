import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import {
  DeviceNameModel,
  reqSessionDTOType,
  SessionIpModel,
} from '../auth.models';
import add from 'date-fns/add';

@Schema()
export class Session {
  _id: mongoose.Types.ObjectId;
  @Prop({
    required: true,
    type: [String, [String]],
  })
  ip: SessionIpModel;
  @Prop({
    required: true,
  })
  title: string;
  @Prop({
    required: true,
  })
  lastActiveDate: string;
  @Prop({
    required: true,
  })
  deviceId: string;
  @Prop({
    required: true,
    type: [String, [String]],
  })
  deviceName: DeviceNameModel;
  @Prop({
    required: true,
  })
  userId: string;
  @Prop({
    required: true,
  })
  RFTokenIAT: Date;
  @Prop({
    required: true,
  })
  RFTokenObsoleteDate: Date;

  static createSession(
    sessionDTO: reqSessionDTOType,
    SessionModel: SessionModelType,
  ): SessionDocument {
    const SessionInstance = new SessionModel();
    SessionInstance._id = new mongoose.Types.ObjectId();
    SessionInstance.ip = sessionDTO.loginIp;
    SessionInstance.title = 'Title for Session. Need to change in future';
    SessionInstance.lastActiveDate = new Date().toISOString();
    SessionInstance.deviceId = sessionDTO.deviceId;
    SessionInstance.deviceName = sessionDTO.deviceName;
    SessionInstance.userId = sessionDTO.userId;
    SessionInstance.RFTokenIAT = new Date(sessionDTO.refreshTokenIssuedAt);
    SessionInstance.RFTokenObsoleteDate = add(
      new Date(sessionDTO.refreshTokenIssuedAt),
      {
        seconds: 20,
      },
    );

    return SessionInstance;
  }
}

export type SessionModelType = Model<Session> & SessionModelStaticType;
export const SessionSchema = SchemaFactory.createForClass(Session);

export type SessionModelStaticType = {
  createSession: (
    sessionDTO: reqSessionDTOType,
    SessionModel: SessionModelType,
  ) => SessionDocument;
};

const SessionStaticMethods: SessionModelStaticType = {
  createSession: Session.createSession,
};

SessionSchema.statics = SessionStaticMethods;

export type SessionDocument = HydratedDocument<Session>;
