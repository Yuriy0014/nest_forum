import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailAdapter {
  private readonly user: string;
  private readonly pass: string;

  constructor(private readonly configService: ConfigService) {
    this.user = configService.getOrThrow('GMAIL_LOGIN');
    this.pass = configService.getOrThrow('GMAIL_PASS');
  }
  async sendEmail(email: string, subject: string, message: string) {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.user, // generated ethereal user
        pass: this.pass, // generated ethereal password
      },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: 'luckyegor1997@gmail.com', // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: message, // html body
    });

    console.log(info);
  }
}
