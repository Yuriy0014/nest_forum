import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import {CommentEntity} from "../../comments/entities/coments.entities";
import {UserEntity} from "../../users/entities/user.entities";

enum gameStatus {
    pending = "PendingSecondPlayer",
    active = "GameInProgress",
    end = "GameOver"
}

export abstract class PairBase {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @OneToOne(() => UserEntity)
    @JoinColumn()
        firstPlayerId: string

    @OneToOne(() => UserEntity)
    @JoinColumn()
        secondPlayerId: string

    @Column()
        question_1_id: string

    @Column()
        question_1_player1_status: string

    @Column()
        question_1_player1_answ_date: Date

    @Column()
        question_1_player2_status: string

    @Column()
        question_1_player2_answ_date: Date

    @Column()
        question_2_id: string

    @Column()
        question_2_player1_status: string

    @Column()
        question_2_player1_answ_date: Date

    @Column()
        question_2_player2_status: string

    @Column()
        question_2_player2_answ_date: Date

    @Column()
        question_3_id: string

    @Column()
        question_3_player1_status: string

    @Column()
        question_3_player1_answ_date: Date

    @Column()
        question_3_player2_status: string

    @Column()
        question_3_player2_answ_date: Date

    @Column()
        question_4_id: string

    @Column()
        question_4_player1_status: string

    @Column()
        question_4_player1_answ_date: Date

    @Column()
        question_4_player2_status: string

    @Column()
        question_4_player2_answ_date: Date

    @Column()
        question_5_id: string

    @Column()
        question_5_player1_status: string

    @Column()
        question_5_player1_answ_date: Date

    @Column()
        question_5_player2_status: string

    @Column()
        question_5_player2_answ_date: Date

    @Column({
        type: "enum",
        enum: gameStatus,
        default: gameStatus.pending
    })
        status: gameStatus

    @CreateDateColumn()
        pairCreatedDate: Date

    @Column()
        startGameDate: Date

    @Column()
        finishGameDate: Date

    @OneToMany(() => CommentEntity, (comment) => comment.post)
        comments: CommentEntity[];
}


@Entity({name: "activepairs"})
export class ActivePairEntity extends PairBase {}


@Entity({name: "finishedpairs"})
export class FinishedPairEntity extends PairBase {}
