import {extendedLikesInfoViewModel} from '../../likes/models/likes.models-sql';
import {IsNotEmpty, IsString, Length, Matches} from 'class-validator';

export class PostCreateModelBase {
    @IsString()
    @Length(2, 30)
    @IsNotEmpty()
    @Matches(/.*\S+.*/, {
        message: 'title should not consist of whitespace characters',
    })
        title: string;

    @IsString()
    @Length(2, 100)
    @IsNotEmpty()
    @Matches(/.*\S+.*/, {
        message: 'shortDescription should not consist of whitespace characters',
    })
        shortDescription: string;

    @IsString()
    @Length(2, 1000)
    @IsNotEmpty()
    @Matches(/.*\S+.*/, {
        message: 'content should not consist of whitespace characters',
    })
        content: string;
}

export class PostCreateModelFromBlog extends PostCreateModelBase {
    blogId: string;
}

export class PostUpdateModel {
    @IsString()
    @Length(2, 30)
    @IsNotEmpty()
    @Matches(/.*\S+.*/, {
        message: 'title should not consist of whitespace characters',
    })
        title: string;

    @IsString()
    @Length(2, 100)
    @IsNotEmpty()
    @Matches(/.*\S+.*/, {
        message: 'shortDescription should not consist of whitespace characters',
    })
        shortDescription: string;

    @IsString()
    @Length(2, 1000)
    @IsNotEmpty()
    @Matches(/.*\S+.*/, {
        message: 'content should not consist of whitespace characters',
    })
        content: string;
}

export type PostViewModel = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: extendedLikesInfoViewModel;
};


export type PostsWithPaginationModel = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: PostViewModel[];
};
