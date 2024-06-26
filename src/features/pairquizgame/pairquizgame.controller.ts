import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpException,
    NotFoundException,
    Param,
    Post,
    Request,
    UseGuards
} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {PairQuizQueryRepoSQL} from "./pairquizgame.query-repo";
import {Result} from "../helpers/result_types";
import {CommandBus} from "@nestjs/cqrs";
import {ActivePairEntity} from "./entities/quiz-pair.entities";
import {ConnectToQuizCommand} from "./use-cases/ConnectToQuizUseCase";
import {SendAnswerQuizCommand} from "./use-cases/SendAnswerQuizUseCase";
import {AnswerDTO} from "./dto/quiz.dto";

@UseGuards(JwtAuthGuard)
@Controller('pair-game-quiz/pairs')
export class PairQuizGameController {
    constructor(
        private readonly pairQuizQueryRepoSQL: PairQuizQueryRepoSQL,
        private commandBus: CommandBus,
    ) {
    }

    @Get('my-current')
    async getCurrentPair(@Request() req: any) {
        const activePair = await this.pairQuizQueryRepoSQL.findActivePair(req.user.userId)

        if (!activePair) {
            throw new NotFoundException('Для текущего юзера нет активной пары')
        }

        return activePair
    }

    @Get(':id')
    async getFinishedPairById(@Param('id') id: string,
                              @Request() req: any) {
        const foundPair = await this.pairQuizQueryRepoSQL.findFinishedPairById(id)

        if (!foundPair) {
            throw new NotFoundException('Не найдена игра с таким id')
        }

        if (req.user.userId !== foundPair.firstPlayerProgress.player.id
            || req.user.userId !== foundPair.secondPlayerProgress.player.id) {

            throw new ForbiddenException('Вы не участвовали вы этой игре. Резултаты недоступны')
        }

        return foundPair
    }

    @Post('connection')
    async connectToPair(@Request() req: any) {
        const connection: Result<ActivePairEntity> = await this.commandBus.execute(
            new ConnectToQuizCommand(req.user.userId),
        );

        if (connection.data === null) {
            throw new HttpException(
                connection.errorMessage!,
                connection.resultCode,
            );
        }
        return connection.data;
    }

    @Post('my-current/answers')
    async sendAnswer(@Request() req: any,
                     @Body() inputAnswer: AnswerDTO) {
        const answerSendResult: Result<ActivePairEntity> = await this.commandBus.execute(
            new SendAnswerQuizCommand(req.user.userId,inputAnswer),
        );

        if (answerSendResult.data === null) {
            throw new HttpException(
                answerSendResult.errorMessage!,
                answerSendResult.resultCode,
            );
        }
        return answerSendResult.data;
    }


}
