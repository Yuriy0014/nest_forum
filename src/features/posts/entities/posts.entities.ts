import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {BlogEntity} from "../../blogs/entities/blogs.entities";
import {CommentEntity} from "../../comments/entities/coments.entities";


@Entity({name: "posts"})
export class PostEntity {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column()
        title: string

    @Column()
        shortDescription: string

    @Column()
        content: string

    @Column()
        blogId: string

    @Column()
        blogName: string

    @Column()
        createdAt: Date

    @ManyToOne(() => BlogEntity, (blog) => blog.posts)
        blog: BlogEntity

    @OneToMany(() => CommentEntity, (comment) => comment.post)
        comments: CommentEntity[];

}