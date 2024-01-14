import {Injectable, InternalServerErrorException} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {ActivePairEntity, answerStatus, FinishedPairEntity} from "./entities/quiz-pair.entities";
import {addNewQuestionId, addSecondPlayerDTO, answerStatusUpdateDTO, createPairDTO, endGameDTO} from "./dto/quiz.dto";
import {QuestionEntity} from "../quizquestions/entities/quiz-question.entities";

@Injectable()
export class PairQuizRepoSQL {
    private activePairRepository: Repository<ActivePairEntity>;
    private finishedPairRepository: Repository<FinishedPairEntity>;

    constructor(@InjectDataSource() protected dataSource: DataSource) {
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
                return foundPair;
            } else {
                return null;
            }
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    async updateAnswerStatus(dto: answerStatusUpdateDTO) {
        try {
            dto.activePair[`question_${dto.questionNumber}_player${dto.playerNumber}_status`] = dto.answerStatus
            dto.activePair[`question_${dto.questionNumber}_player${dto.playerNumber}_answ_date`] = dto.answerDate

            // Если ответ правильный - увеличиваем счетчик на единичку
            if (dto.answerStatus === answerStatus.Correct) {
                this.updatePlayerScore(dto.activePair, dto.playerNumber);
            }

            // Если игрок первым ответил на пять вопросов - ему + очко за скорость
            const otherPlayerNumber = dto.playerNumber === 1 ? 2 : 1
            const otherPlayer5QuestionStatus = dto.activePair[`question_5_player${otherPlayerNumber}_status`]
            if (dto.questionNumber === 5 && otherPlayer5QuestionStatus === null) {
                this.updatePlayerScore(dto.activePair, dto.playerNumber);
            }

            await this.activePairRepository.save(dto.activePair)
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    private updatePlayerScore(activePair, playerNumber, increment = 1) {
        if (playerNumber === 1) {
            activePair.firstPlayerScore = (activePair.firstPlayerScore) + increment;
        } else if (playerNumber === 2) {
            activePair.secondPlayerScore = (activePair.secondPlayerScore) + increment;
        }
    }

    async addNewQuestionId(dto: addNewQuestionId) {
        try{
            dto.activePair[`question_${dto.questionNumber}_id`] = dto.newQuestionId
            await this.activePairRepository.save(dto.activePair)
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    async finishActiveGame(dto:endGameDTO) {
        try {
            // Удаляем запись из Active и переносим её в Finished
            const delResult = await this.activePairRepository.delete(dto.activePair.id)

            // Переносим в Finished - просто перемапливаем по сути
            const newFinishedPair = new FinishedPairEntity();

            newFinishedPair.firstPlayerId = dto.activePair.firstPlayerId;
            newFinishedPair.firstPlayerLogin = dto.activePair.firstPlayerLogin;
            newFinishedPair.firstPlayerScore = dto.activePair.firstPlayerScore;
            newFinishedPair.secondPlayerId = dto.activePair.secondPlayerId;
            newFinishedPair.secondPlayerLogin = dto.activePair.secondPlayerId;
            newFinishedPair.secondPlayerScore = dto.activePair.secondPlayerScore;
            newFinishedPair.question_1_id = dto.activePair.question_1_id ;
            newFinishedPair.question_1_player1_status = dto.activePair.question_1_player1_status;
            newFinishedPair.question_1_player1_answ_date = dto.activePair.question_1_player1_answ_date;
            newFinishedPair.question_1_player2_status = dto.activePair.question_1_player2_status;
            newFinishedPair.question_1_player2_answ_date = dto.activePair.question_1_player2_answ_date;
            newFinishedPair.question_2_id = dto.activePair.question_2_id ;
            newFinishedPair.question_2_player1_status = dto.activePair.question_2_player1_status;
            newFinishedPair.question_2_player1_answ_date = dto.activePair.question_2_player1_answ_date;
            newFinishedPair.question_2_player2_status = dto.activePair.question_2_player2_status;
            newFinishedPair.question_2_player2_answ_date = dto.activePair.question_2_player2_answ_date;
            newFinishedPair.question_3_id = dto.activePair.question_3_id ;
            newFinishedPair.question_3_player1_status = dto.activePair.question_3_player1_status;
            newFinishedPair.question_3_player1_answ_date = dto.activePair.question_3_player1_answ_date;
            newFinishedPair.question_3_player2_status = dto.activePair.question_3_player2_status;
            newFinishedPair.question_3_player2_answ_date = dto.activePair.question_3_player2_answ_date;
            newFinishedPair.question_4_id = dto.activePair.question_4_id ;
            newFinishedPair.question_4_player1_status = dto.activePair.question_4_player1_status;
            newFinishedPair.question_4_player1_answ_date = dto.activePair.question_4_player1_answ_date;
            newFinishedPair.question_4_player2_status = dto.activePair.question_4_player2_status;
            newFinishedPair.question_4_player2_answ_date = dto.activePair.question_4_player2_answ_date;
            newFinishedPair.question_5_id = dto.activePair.question_5_id ;
            newFinishedPair.question_5_player1_status = dto.activePair.question_5_player1_status;
            newFinishedPair.question_5_player1_answ_date = dto.activePair.question_5_player1_answ_date;
            newFinishedPair.question_5_player2_status = dto.activePair.question_5_player2_status;
            newFinishedPair.question_5_player2_answ_date = dto.activePair.question_5_player2_answ_date;
            newFinishedPair.status = dto.endStatus;
            newFinishedPair.pairCreatedDate = dto.activePair.pairCreatedDate;
            newFinishedPair.startGameDate = dto.activePair.startGameDate;
            newFinishedPair.finishGameDate = dto.finishGameDate;

            await this.finishedPairRepository.save(newFinishedPair)

        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }


    }

    async createPair(createDTO: createPairDTO): Promise<void> {
        try {
            await this.activePairRepository
                .createQueryBuilder()
                .insert()
                .into(ActivePairEntity)
                .values([
                    {
                        firstPlayerId: createDTO.firstPlayerId,
                        firstPlayerLogin: createDTO.firstPlayerLogin,
                        firstPlayerScore: createDTO.firstPlayerScore,
                        secondPlayerScore: createDTO.secondPlayerScore,
                        status: createDTO.status,
                        pairCreatedDate: createDTO.pairCreatedDate
                    },
                ])
                .execute()
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }

    async addSecondPlayer(addSecondPlayerDTO: addSecondPlayerDTO) {
        try {
            const result = await this.activePairRepository
                .createQueryBuilder()
                .update(ActivePairEntity)
                .set({
                    secondPlayerId: addSecondPlayerDTO.secondPlayerId,
                    secondPlayerLogin: addSecondPlayerDTO.secondPlayerLogin,
                    question_1_id: addSecondPlayerDTO.firstQuestionId,
                    status: addSecondPlayerDTO.status,
                    startGameDate: addSecondPlayerDTO.startGameDate

                })
                .where("id = :id", {id: addSecondPlayerDTO.pairId})
                .returning("*")
                .execute();

            return result.raw[0]
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }
}


