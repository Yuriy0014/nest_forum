import {Controller, Delete, HttpCode,} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Controller('testing')
export class TestingController {
    constructor(@InjectDataSource() protected dataSource: DataSource) {
    }

    @Delete('all-data')
    @HttpCode(204)
    async deleteAll() {
        await this.dataSource.query(`DELETE
                                     FROM public.sessions`);
        await this.dataSource.query(`DELETE
                                     FROM public.userslikesconnection`);
        await this.dataSource.query(`DELETE
                                     FROM public.comments`);
        await this.dataSource.query(`DELETE
                                     FROM public.users`);
        await this.dataSource.query(`DELETE
                                     FROM public.posts`);
        await this.dataSource.query(`DELETE
                                     FROM public.blogs`);
        await this.dataSource.query(`DELETE
                                     FROM public.likes`);
        await this.dataSource.query(`DELETE
                                     FROM public.quiz_finished_pairs`);
        await this.dataSource.query(`DELETE
                                     FROM public.quiz_active_pairs`);
        await this.dataSource.query(`DELETE
                                     FROM public.quiz_questions`);
    }
}
