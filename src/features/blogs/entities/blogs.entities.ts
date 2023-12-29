import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {PostEntity} from "../../posts/entities/posts.entities";


@Entity({name: "blogs"})
export class BlogEntity {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column()
        name: string

    @Column()
        description: string

    @Column()
        websiteUrl: string

    @Column()
        createdAt: Date

    @Column()
        isMembership: boolean

    @OneToMany(() => PostEntity, (post) => post.blog)
        posts: PostEntity[]

}