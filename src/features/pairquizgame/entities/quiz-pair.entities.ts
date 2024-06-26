import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import {UserEntity} from "../../users/entities/user.entities";

export enum gameStatus {
    pending = "PendingSecondPlayer",
    active = "GameInProgress",
    end = "GameOver"
}

export enum answerStatus {
    Correct = "Correct",
    Incorrect = "Incorrect"
}

export abstract class PairBase {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @OneToOne(() => UserEntity)
    @JoinColumn({ name: 'firstPlayerId' })
        firstPlayer: UserEntity;

    @Column({ type: 'uuid', name: 'firstPlayerId', insert: false, update: false })
        firstPlayerId: string;

    @Column()
        firstPlayerLogin: string

    @Column()
        firstPlayerScore: number

    @Column({type: 'uuid'})
        secondPlayerId: string

    @Column()
        secondPlayerLogin: string

    @Column()
        secondPlayerScore: number

    @Column({nullable: true, type: 'uuid'})
        question_1_id: string

    @Column({nullable: true})
        question_1_player1_status: answerStatus

    @Column({nullable: true})
        question_1_player1_answ_date: Date

    @Column({nullable: true})
        question_1_player2_status: answerStatus

    @Column({nullable: true})
        question_1_player2_answ_date: Date

    @Column({nullable: true, type: 'uuid'})
        question_2_id: string

    @Column({nullable: true})
        question_2_player1_status: answerStatus

    @Column({nullable: true})
        question_2_player1_answ_date: Date

    @Column({nullable: true})
        question_2_player2_status: answerStatus

    @Column({nullable: true})
        question_2_player2_answ_date: Date

    @Column({nullable: true, type: 'uuid'})
        question_3_id: string

    @Column({nullable: true})
        question_3_player1_status: answerStatus

    @Column({nullable: true})
        question_3_player1_answ_date: Date

    @Column({nullable: true})
        question_3_player2_status: answerStatus

    @Column({nullable: true})
        question_3_player2_answ_date: Date

    @Column({nullable: true, type: 'uuid'})
        question_4_id: string

    @Column({nullable: true})
        question_4_player1_status: answerStatus

    @Column({nullable: true})
        question_4_player1_answ_date: Date

    @Column({nullable: true})
        question_4_player2_status: answerStatus

    @Column({nullable: true})
        question_4_player2_answ_date: Date

    @Column({nullable: true, type: 'uuid'})
        question_5_id: string

    @Column({nullable: true})
        question_5_player1_status: answerStatus

    @Column({nullable: true})
        question_5_player1_answ_date: Date

    @Column({nullable: true})
        question_5_player2_status: answerStatus

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

}

@Entity({name: "quiz_active_pairs"})
export class ActivePairEntity extends PairBase {}

@Entity({name: "quiz_finished_pairs"})
export class FinishedPairEntity extends PairBase {}
