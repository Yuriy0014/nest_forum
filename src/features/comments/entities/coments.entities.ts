import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {PostEntity} from "../../posts/entities/posts.entities";
import {UserEntity} from "../../users/entities/user.entities";


@Entity({name: "comments"})
export class CommentEntity {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column()
        name: string

    @Column()
        postId: string

    @Column()
        content: string

    @Column()
        userId: string

    @Column()
        userLogin: string

    @Column()
        createdAt: Date


    @ManyToOne(() => PostEntity, (post) => post.comments)
        post: PostEntity

    @ManyToOne(() => UserEntity, (user) => user.comments)
        user: UserEntity

}