import {Controller, Get, Post, UseGuards} from '@nestjs/common';
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
    async getCurrentPair(){
        return true
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
