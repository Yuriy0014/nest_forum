import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {UserEntity} from "../../users/entities/user.entities";
import {likeStatusModel} from "../models/likes.models-sql";


@Entity({name: "likes"})
export class LikeInfoEntity {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column()
        ownerType: string

    @Column()
        ownerId: string

    @Column()
        likesCount: number

    @Column()
        dislikesCount: number
}

@Entity({name: "userslikesconnection"})
export class UsersLikesConnectionEntity {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column()
        userId: string

    @Column()
        userLogin: string

    @Column()
        addedAt: Date

    @Column()
        likedObjectId: string

    @Column()
        likedObjectType: string

    @Column()
        status: likeStatusModel

    @ManyToOne(() => UserEntity, (user) => user.usersLikes)
        user: UserEntity
}