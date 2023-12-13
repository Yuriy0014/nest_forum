import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogViewModel } from '../../blogs/models/blogs.models-sql';
import { BlogsQueryRepoSQL } from '../../blogs/blogs.query-repo-sql';

@ValidatorConstraint({ name: 'ExistingBlog', async: true })
@Injectable()
export class ExistingBlogConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepoSQL) {}

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
