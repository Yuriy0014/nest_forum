import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserDBModel } from '../../features/users/models/users.models.sql';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmailConfirmationMessage(user: UserDBModel) {
    await this.mailerService.sendMail({
      to: user.email,
      from: '"Takeo Team" <luckyegor1997@gmail.com>', // override default from
      subject: 'Welcome to Takeo blog! Confirm your Email',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.login,
        confirmationCode: user.emailConfirmationCode,
      },
    });
  }

  async sendPasswordRecoveryMessage(
    name: string,
    email: string,
    passwordRecoveryCode: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      from: '"Takeo Team" <luckyegor1997@gmail.com>', // override default from
      subject: 'Password recovery mail for Takeo blog!',
      template: './passRecovery', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name,
        code: passwordRecoveryCode,
      },
    });
  }
}
