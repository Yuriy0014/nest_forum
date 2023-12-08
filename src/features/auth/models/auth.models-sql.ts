export class SessionDBModel {
  constructor(
    public id: string,
    public ip: string,
    public title: string,
    public lastActiveDate: Date,
    public deviceId: string,
    public deviceName: string,
    public userId: string,
    public RFTokenIAT: Date,
    public RFTokenObsoleteDate: Date,
  ) {}
}
