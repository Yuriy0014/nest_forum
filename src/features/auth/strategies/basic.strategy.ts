import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {BasicStrategy as Strategy} from 'passport-http';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    private readonly BASIC_LOGIN: string;
    private readonly BASIC_PASS: string;

    constructor(private readonly configService: ConfigService) {
        super();
        this.BASIC_LOGIN = configService.getOrThrow('BASIC_LOGIN');
        this.BASIC_PASS = configService.getOrThrow('BASIC_PASS');
    }

    public validate = async (
        username: string,
        password: string,
    ): Promise<boolean> => {
        if (this.BASIC_LOGIN === username && this.BASIC_PASS === password) {
            return true;
        }
        throw new UnauthorizedException();
    };
}
