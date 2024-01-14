import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "quiz_questions"})
export class QuestionEntity {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column()
        body: string

    @Column("text", { array: true })
        correctAnswers: string[]

    @Column({default: false})
        published: boolean

    @Column()
        createdAt: Date

    @Column({nullable: true})
        updatedAt: Date
}