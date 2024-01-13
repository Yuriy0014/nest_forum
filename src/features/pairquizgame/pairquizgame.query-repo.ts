import {Injectable, InternalServerErrorException} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {ActivePairEntity, FinishedPairEntity} from "./entities/quiz-pair.entities";
import {QuestionEntity} from "../quizquestions/entities/quiz-question.entities";
import {MapPairViewModelSQL} from "./helpers/map-PairViewModelSQL";

@Injectable()
export class PairQuizQueryRepoSQL {
    private activePairRepository: Repository<ActivePairEntity>;
    private finishedPairRepository: Repository<FinishedPairEntity>;

    constructor(@InjectDataSource() protected dataSource: DataSource,
                private readonly mapActivePairViewModelSQL: MapPairViewModelSQL) {
        this.activePairRepository = dataSource.getRepository(ActivePairEntity);
        this.finishedPairRepository = dataSource.getRepository(FinishedPairEntity);
    }

    async findActivePair(userId: string) {
        try {
            const foundPair = await this.activePairRepository
                .createQueryBuilder('ap')
                .leftJoinAndSelect(QuestionEntity, 'question1', 'question1.id = ap.question_1_id')
                .leftJoinAndSelect(QuestionEntity, 'question2', 'question2.id = ap.question_2_id')
                .leftJoinAndSelect(QuestionEntity, 'question3', 'question3.id = ap.question_3_id')
                .leftJoinAndSelect(QuestionEntity, 'question4', 'question4.id = ap.question_4_id')
                .leftJoinAndSelect(QuestionEntity, 'question5', 'question5.id = ap.question_5_id')
                .select([
                    'ap.id',
                    'ap.firstPlayerId',
                    'ap.secondPlayerId',
                    'ap.question_1_id',
                    'question1.body as question_1_body',
                    'ap.question_1_player1_status',
                    'ap.question_1_player1_answ_date',
                    'ap.question_2_id',
                    'question2.body as question_2_body',
                    'ap.question_2_player1_status',
                    'ap.question_2_player1_answ_date',
                    'ap.question_3_id',
                    'question3.body as question_3_body',
                    'ap.question_3_player1_status',
                    'ap.question_3_player1_answ_date',
                    'ap.question_4_id',
                    'question4.body as question_4_body',
                    'ap.question_4_player1_status',
                    'ap.question_4_player1_answ_date',
                    'ap.question_5_id',
                    'question5.body as question_5_body',
                    'ap.question_5_player1_status',
                    'ap.question_5_player1_answ_date',
                    'ap.status',
                    'ap.pairCreatedDate',
                    'ap.startGameDate',
                    'ap.finishGameDate'
                ])
                .where("ap.firstPlayerId = :userId OR ap.secondPlayerId = :userId ", {userId})
                .getOne()

            if (foundPair) {
                return this.mapActivePairViewModelSQL.getPairViewModel(foundPair);
            } else {
                return null;
            }
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    async findFinishedPairById(pairId: string) {
        try {
            const foundPair = await this.finishedPairRepository
                .createQueryBuilder('ap')
                .leftJoinAndSelect(QuestionEntity, 'question1', 'question1.id = ap.question_1_id')
                .leftJoinAndSelect(QuestionEntity, 'question2', 'question2.id = ap.question_2_id')
                .leftJoinAndSelect(QuestionEntity, 'question3', 'question3.id = ap.question_3_id')
                .leftJoinAndSelect(QuestionEntity, 'question4', 'question4.id = ap.question_4_id')
                .leftJoinAndSelect(QuestionEntity, 'question5', 'question5.id = ap.question_5_id')
                .select([
                    'ap.id',
                    'ap.firstPlayerId',
                    'ap.secondPlayerId',
                    'ap.question_1_id',
                    'question1.body as question_1_body',
                    'ap.question_1_player1_status',
                    'ap.question_1_player1_answ_date',
                    'ap.question_2_id',
                    'question2.body as question_2_body',
                    'ap.question_2_player1_status',
                    'ap.question_2_player1_answ_date',
                    'ap.question_3_id',
                    'question3.body as question_3_body',
                    'ap.question_3_player1_status',
                    'ap.question_3_player1_answ_date',
                    'ap.question_4_id',
                    'question4.body as question_4_body',
                    'ap.question_4_player1_status',
                    'ap.question_4_player1_answ_date',
                    'ap.question_5_id',
                    'question5.body as question_5_body',
                    'ap.question_5_player1_status',
                    'ap.question_5_player1_answ_date',
                    'ap.status',
                    'ap.pairCreatedDate',
                    'ap.startGameDate',
                    'ap.finishGameDate'
                ])
                .where("ap.id = :pairId", {pairId})
                .getOne()

            if (foundPair) {
                return this.mapActivePairViewModelSQL.getPairViewModel(foundPair);
            } else {
                return null;
            }
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }
}