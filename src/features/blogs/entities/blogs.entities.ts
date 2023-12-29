import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';


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


}