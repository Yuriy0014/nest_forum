import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './features/blogs/blogs.controller';
import { BlogsService } from './features/blogs/blogs.service';
import { BlogsRepo } from './features/blogs/blogs.repo';
import { BlogsQueryRepo } from './features/blogs/blogs.query-repo';

@Module({
  imports: [MongooseModule.forRoot('mongodb://127.0.0.1:27017/nest_forum')],
  controllers: [AppController, BlogsController],
  providers: [AppService, BlogsService, BlogsRepo, BlogsQueryRepo],
})
export class AppModule {}
