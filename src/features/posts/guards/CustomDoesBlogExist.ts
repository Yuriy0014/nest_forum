import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepoMongo } from '../../blogs/blogs.query-repo-mongo';
import { BlogViewModel } from '../../blogs/models/blogs.models-mongo';

@ValidatorConstraint({ name: 'ExistingBlog', async: true })
@Injectable()
export class ExistingBlogConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepoMongo) {}

  async validate(value: any): Promise<boolean> {
    const foundBlog: BlogViewModel | null =
      await this.blogsQueryRepo.findBlogById(value);
    if (!foundBlog) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return `Blog with provided id does not exist`;
  }
}

export function ExistingBlog(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: ExistingBlogConstraint,
    });
  };
}
