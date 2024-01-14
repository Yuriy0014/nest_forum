import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {Result} from '../../helpers/result_types';
import {Answer} from "../models/pairquizgame.models";
import {PairQuizRepoSQL} from "../pairquizgame.repo";
import {QuestionQuizQueryRepoSQL} from "../../quizquestions/quizquestions.query-repo";
import {HttpStatus} from "@nestjs/common";
import {addNewQuestionId, AnswerDTO, answerStatusUpdateDTO, endGameDTO} from "../dto/quiz.dto";
import {answerStatus, gameStatus} from "../entities/quiz-pair.entities";

export class SendAnswerQuizCommand {
    constructor(
        public userId: string,
        public answerDTO: AnswerDTO,
    ) {
    }
}

@CommandHandler(SendAnswerQuizCommand)
export class ConnectToQuizUseCase implements ICommandHandler<SendAnswerQuizCommand> {
    constructor(
        private readonly questionQuizQueryRepoSQL: QuestionQuizQueryRepoSQL,
        private readonly pairQuizRepoSQL: PairQuizRepoSQL,
    ) {
    }

    async execute(command: SendAnswerQuizCommand): Promise<Result<Answer>> {
        const activePair = await this.pairQuizRepoSQL.findActivePair(command.userId);
        if (!activePair) {
            return this.noActiveGameResponse();
        }

        const playerNumber = activePair.firstPlayerId === command.userId ? 1 :
            activePair.secondPlayerId === command.userId ? 2 : null;

        if (!playerNumber) {
            return this.internalErrorResponse();
        }

        if (this.hasPlayerAnsweredAllQuestions(activePair, playerNumber)) {
            return this.noActiveGameResponse();
        }

        const currentQuestionNumber = this.getCurrentQuestionNumber(activePair, playerNumber);
        if (currentQuestionNumber === null) {
            return this.cantFindCurrentQuestion();
        }

        const currentQuestionId = activePair[`question_${currentQuestionNumber}_id`];
        const isAnswerCorrect = await this.questionQuizQueryRepoSQL
            .checkAnswer(currentQuestionId, command.answerDTO.answer);
        const answerDate = new Date();

        const updatePairInfo: answerStatusUpdateDTO = {
            activePair,
            questionNumber: currentQuestionNumber,
            playerNumber,
            answerStatus: isAnswerCorrect ? answerStatus.Correct : answerStatus.Incorrect,
            answerDate,
        };

        await this.pairQuizRepoSQL.updateAnswerStatus(updatePairInfo);

        // Получаем id следующего вопроса, если это был не пятый вопрос
        if (currentQuestionNumber !== 5) {
            const newQuestion = await this.questionQuizQueryRepoSQL.getRandomQuestion()
            if (!newQuestion) {
                return this.noNewQuestion();
            }

            const newQuestionIdDTO: addNewQuestionId = {
                activePair,
                newQuestionId: newQuestion.id,
                questionNumber: currentQuestionNumber + 1
            }

            await this.pairQuizRepoSQL.addNewQuestionId(newQuestionIdDTO)
        }

        // Если это пятый ответ пользователя, а у второго пользователя уже 5 ответов - закрываем
        if(currentQuestionNumber === 5){
            const secondPlayerNumber = playerNumber === 1 ? 2 : 1
            if (activePair[`question_5_player${secondPlayerNumber}_status`] !== null) {
                const endGameData: endGameDTO = {
                    activePair: activePair,
                    finishGameDate: new Date(),
                    endStatus: gameStatus.end
                }
                await this.pairQuizRepoSQL.finishActiveGame(endGameData)
            }
        }

        const answerData: Answer = {
            questionId: currentQuestionId,
            answerStatus: isAnswerCorrect ? answerStatus.Correct : answerStatus.Incorrect,
            addedAt: answerDate.toISOString()
        };

        return {
            resultCode: HttpStatus.OK,
            data: answerData,
        };
    }

    private hasPlayerAnsweredAllQuestions(activePair: any, playerNumber: number): boolean {
        return activePair[`question_5_player${playerNumber}_status`] !== null;
    }

    private getCurrentQuestionNumber(activePair: any, playerNumber: number): number | null {
        const questionsArr: (answerStatus | null)[] = [];
        for (let i = 1; i <= 5; i++) {
            questionsArr.push(activePair[`question_${i}_player${playerNumber}_status`]);
        }

        for (let i = 0; i < questionsArr.length; i++) {
            if (questionsArr[i] === null) {
                return i + 1;
            }
        }

        return null;
    }

    private createErrorResponse(
        statusCode: HttpStatus,
        errorMessage: string
    ): Result<Answer> {
        return {
            resultCode: statusCode,
            data: null,
            errorMessage: errorMessage,
        };
    }

    private noActiveGameResponse(): Result<Answer> {
        return this.createErrorResponse(
            HttpStatus.FORBIDDEN,
            'У данного пользователя нет активной игры');
    }

    private cantFindCurrentQuestion(): Result<Answer> {
        return this.createErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Что-то пошло не так. Не удалось понять, на какой вопрос ты отвечал');
    }

    private noNewQuestion(): Result<Answer> {
        return this.createErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'В базе нет вопросов для игры');
    }

    private internalErrorResponse(): Result<Answer> {
        return this.createErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'При отправке ответа что-то пошло не так');
    }
}
