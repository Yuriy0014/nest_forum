import {Controller, ForbiddenException, Get, NotFoundException, Param, Post, Request, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {PairQuizQueryRepoSQL} from "./pairquizgame.query-repo";

@UseGuards(JwtAuthGuard)
@Controller('pair-game-quiz/pairs')
export class PairQuizGameController {
    constructor(
        private readonly pairQuizQueryRepoSQL: PairQuizQueryRepoSQL
    ) {
    }

    @Get('my-current')
    async getCurrentPair(@Request() req: any){
        const activePair = await this.pairQuizQueryRepoSQL.findActivePair(req.userId)

        if (!activePair) {
            throw new NotFoundException('Для текущего юзера нет активной пары')
        }

        return activePair
    }

    @Get(':id')
    async getFinishedPairById(@Param('id') id: string,
                      @Request() req: any){
        const foundPair = await this.pairQuizQueryRepoSQL.findFinishedPairById(id)

        if (!foundPair) {
            throw new NotFoundException('Не найдена игра с таким id')
        }

        if(req.userId !== foundPair.firstPlayerProgress.player.id
            || req.userId !== foundPair.secondPlayerProgress.player.id ) {

            throw new ForbiddenException('Вы не участвовали вы этой игре. Резултаты недоступны')
        }

        return foundPair
    }

    @Post('connection')
    async connectToPair(){
        return true
    }

    @Post('my-current/answers')
    async sendAnswer(){
        return true
    }


}
