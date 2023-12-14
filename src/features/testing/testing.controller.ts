import {
  Controller,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await Promise.all([
      this.dataSource.query(`DELETE FROM public.sessions`),
      this.dataSource.query(`DELETE FROM public.users`),
      this.dataSource.query(`DELETE FROM public.blogs`),
      this.dataSource.query(`DELETE FROM public.posts`),
      this.dataSource.query(`DELETE FROM public.likes`),
      this.dataSource.query(`DELETE FROM public.userslikesconnection`),
      this.dataSource.query(`DELETE FROM public.comments`),
    ]).catch((e) => {
      console.log(e);
      throw new HttpException('Not Found', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  }
}
