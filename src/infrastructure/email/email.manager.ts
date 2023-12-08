import { Injectable } from '@nestjs/common';
import { EmailAdapter } from './email.adapter';
import { UserDBModel } from '../../features/users/models/users.models.sql';

@Injectable()
export class EmailManager {
  constructor(private readonly emailAdapter: EmailAdapter) {}

  async sendPasswordRecoveryMessage(
    email: string,
    code: string,
  ): Promise<void> {
    const messageRecovery = `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
      </p>`;
    await this.emailAdapter.sendEmail(
      email,
      'password recovery',
      messageRecovery,
    );
  }

  async sendEmailConfirmationMessage(user: UserDBModel): Promise<void> {
    const MessageHTMLText = `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${user.emailConfirmationCode}'>complete registration</a>
 </p>`;

    await this.emailAdapter.sendEmail(
      user.email,
      'Email confirmation',
      MessageHTMLText,
    );
  }
}
