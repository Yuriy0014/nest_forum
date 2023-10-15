import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { UserFilterModel } from './helpers/filter';
import { UserDBModel } from './models/users.models';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from './models/domain/users.domain-entities';
import { MapUserViewModel } from './helpers/map-UserViewModel';

@Injectable()
export class UsersQueryRepo {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    private readonly mapUserViewModel: MapUserViewModel,
  ) {}

  async FindAllUsers(queryFilter: UserFilterModel) {
    const findFilter: FilterQuery<UserDBModel> = {
      $or: [
        {
          'accountData.login': {
            $regex: queryFilter.searchLoginTerm ?? '',
            $options: 'i',
          },
        },
        {
          'accountData.email': {
            $regex: queryFilter.searchEmailTerm ?? '',
            $options: 'i',
          },
        },
      ],
    };
    const sortFilter: any = {
      [queryFilter.sortBy]: queryFilter.sortDirection,
    };

    const foundUsersMongoose = await this.userModel
      .find(findFilter)
      .lean()
      .sort(sortFilter)
      .skip((queryFilter.pageNumber - 1) * queryFilter.pageSize)
      .limit(queryFilter.pageSize);

    const foundUsers = foundUsersMongoose.map((user) =>
      this.mapUserViewModel.getUserViewModel(user),
    );

    const totalCount = await this.userModel.countDocuments(findFilter);

    return {
      pagesCount: Math.ceil(totalCount / queryFilter.pageSize),
      page: queryFilter.pageNumber,
      pageSize: queryFilter.pageSize,
      totalCount: totalCount,
      items: foundUsers,
    };
  }
}
