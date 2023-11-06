import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CheckCredentialsUseCase } from '../use-cases/CheckCredentialsUseCase';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly checkCredentialsUseCase: CheckCredentialsUseCase,
  ) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.checkCredentialsUseCase.execute({
      loginOrEmail,
      password,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: user.id };
  }
}
