import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {Result} from '../../helpers/result_types';
import {gameStatus} from "../entities/quiz-pair.entities";
import {PairQuizQueryRepoSQL} from "../pairquizgame.query-repo";
import {PairViewModel} from "../models/pairquizgame.models";
import {addSecondPlayerDTO, createPairDTO} from "../dto/quiz.dto";
import {UsersQueryRepoSQL} from "../../users/users.query-repo-sql";
import {PairQuizRepoSQL} from "../pairquizgame.repo";
import {HttpStatus} from "@nestjs/common";
import {QuestionQuizQueryRepoSQL} from "../../quizquestions/quizquestions.query-repo";

export class ConnectToQuizCommand {
    constructor(public userId: string) {
    }
}

@CommandHandler(ConnectToQuizCommand)
export class ConnectToQuizUseCase implements ICommandHandler<ConnectToQuizCommand> {
    constructor(
        private readonly questionQuizQueryRepoSQL: QuestionQuizQueryRepoSQL,
        private readonly pairQuizQueryRepoSQL: PairQuizQueryRepoSQL,
        private readonly pairQuizRepoSQL: PairQuizRepoSQL,
        private readonly usersQueryRepoSQL: UsersQueryRepoSQL,
    ) {
    }

    async execute(command: ConnectToQuizCommand): Promise<Result<PairViewModel>> {
        // Проверяем наличие существующей пары
        let activePair = await this.pairQuizQueryRepoSQL.findActivePair(command.userId)

        // Два случая, сначала проверяем самого польхователя:
        // 1) С фронта прилетел повторный запрос от того же пользователя, который уже открыл пару и ждет напарника
        // 2) Пользователь уже находится в активной паре
        if(activePair) {
            // 1
            if (activePair.firstPlayerProgress.player.id === command.userId && activePair.status === gameStatus.pending )
            {
                return {
                    resultCode: HttpStatus.OK,
                    data: activePair,
                }
            }

            //2
            if (activePair.status === gameStatus.active)
            {
                return {
                    resultCode: HttpStatus.FORBIDDEN,
                    data: null,
                    errorMessage: 'Данный пользователь уже находится в активой игре',
                };
            }
        }

        // Проверяем, есть ли свободная пара
        const pendingPairId = await this.pairQuizQueryRepoSQL.findPendingPair()

        if (pendingPairId) {
            const firstQuestion = await this.questionQuizQueryRepoSQL.getRandomQuestion()
            if(!firstQuestion) {
                return {
                    resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    data: null,
                    errorMessage: 'В базе нет вопросов для игры',
                };
            }

            const user = await this.usersQueryRepoSQL.findUserById(command.userId)
            if(!user){
                return {
                    resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    data: null,
                    errorMessage: 'Возникла ошибка при получении логина юзера',
                };
            }

            const addSecondPlayerDTO: addSecondPlayerDTO = {
                pairId: pendingPairId,
                secondPlayerId: command.userId,
                secondPlayerLogin: user.login,
                status: gameStatus.active,
                startGameDate: new Date(),
                firstQuestionId: firstQuestion.id
            }

            const newActivePair = await this.pairQuizRepoSQL.addSecondPlayer(addSecondPlayerDTO)

            return {
                resultCode: HttpStatus.OK,
                data: newActivePair,
            }
        }

        // Если пары нет - надо создавать
        const user = await this.usersQueryRepoSQL.findUserById(command.userId)
        if(!user){
            return {
                resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
                data: null,
                errorMessage: 'Возникла ошибка при получении логина юзера',
            };
        }
        const createPairDTO:createPairDTO = {
            firstPlayerId: command.userId,
            firstPlayerLogin: user.login,
            pairCreatedDate: new Date(),
            firstPlayerScore: 0,
            secondPlayerScore: 0,
            status: gameStatus.pending
        }

        await this.pairQuizRepoSQL.createPair(createPairDTO)

        // Проверяем, что пара создалась
        activePair = await this.pairQuizQueryRepoSQL.findActivePair(command.userId)

        if(!activePair) {
            return {
                resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
                data: null,
                errorMessage: 'Не удалось создать пару',
            };
        }

        return {
            resultCode: HttpStatus.OK,
            data: activePair,
        }


    }
}
