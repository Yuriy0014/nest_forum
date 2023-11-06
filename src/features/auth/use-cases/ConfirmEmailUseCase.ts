import { Injectable } from '@nestjs/common';
import { UsersRepo } from '../../users/users.repo';

@Injectable()
export class ConfirmEmailUseCase {
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(code: string | undefined): Promise<boolean> {
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
}
