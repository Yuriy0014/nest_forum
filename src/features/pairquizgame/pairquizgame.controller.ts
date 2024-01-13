import {Controller, Get, NotFoundException, Post, Request, UseGuards} from '@nestjs/common';
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
    async getPairById(){
        return true
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
