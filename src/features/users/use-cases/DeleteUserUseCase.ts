import { Injectable } from '@nestjs/common';
import { UsersRepo } from '../users.repo';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(UserId: string): Promise<boolean> {
    const user = await this.usersRepo.findUserById(UserId);
    if (!user) return false;

    return await this.usersRepo.deleteUser(user);
  }
}
