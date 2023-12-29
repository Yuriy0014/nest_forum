import {Injectable} from '@nestjs/common';
import {UserViewModel} from '../models/users.models.mongo';
import {UserEntity} from "../entities/user.entities";

@Injectable()
export class MapUserViewModelSQL {
    getUserViewModel(user: UserEntity): UserViewModel {
        return {
            id: user.id,
            login: user.login,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
        };
    }
}
