import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UsersRepo } from '../users/users.repo';
import { EmailManager } from '../../infrastructure/email/email.manager';
import { MapUserViewModel } from '../users/helpers/map-UserViewModel';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly mapUserViewModel: MapUserViewModel,
    private readonly emailManager: EmailManager,
  ) {}

  async confirmEmail(code: string | undefined): Promise<boolean> {
    if (code === undefined) return false;

    const user = await this.usersRepo.findUserByConfirmationCode(code);
    if (!user) return false;
    if (user.canBeConfirmed(code)) {
      user.emailConfirmation.isConfirmed = true;
      await this.usersRepo.save(user);
      return true;
    }

    return false;
  }

  async resendEmail(email: string): Promise<boolean> {
    if (email === undefined) return false;
    const user = await this.usersRepo.findByLoginOrEmail(email);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;

    // Обновляем код подтверждения
    user.emailConfirmation = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 3,
      }).toISOString(),
      isConfirmed: false,
    };
    //Перезаписываем пользователя
    const updatedUser = await this.usersRepo.updateUserEmailConfirmationInfo(
      user._id,
      user,
    );
    if (!updatedUser) return false;

    try {
      await this.emailManager.sendEmailConfirmationMessage(user);
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }
}
