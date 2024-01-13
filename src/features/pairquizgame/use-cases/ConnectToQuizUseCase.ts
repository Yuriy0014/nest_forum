import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {Result, ResultCode} from '../../helpers/result_types';
import {MapPairViewModelSQL} from "../helpers/map-PairViewModelSQL";
import {gameStatus} from "../entities/quiz-pair.entities";
import {PairQuizQueryRepoSQL} from "../pairquizgame.query-repo";
import {PairViewModel} from "../models/pairquizgame.models";
import {createPairDTO} from "../dto/quiz.dto";
import {UsersQueryRepoSQL} from "../../users/users.query-repo-sql";
import {PairQuizRepoSQL} from "../pairquizgame.repo";

export class ConnectToQuizCommand {
    constructor(public userId: string) {
    }
}

@CommandHandler(ConnectToQuizCommand)
export class CreateBlogUseCase implements ICommandHandler<ConnectToQuizCommand> {
    constructor(
        private readonly mapActivePairViewModelSQL: MapPairViewModelSQL,
        private readonly pairQuizQueryRepoSQL: PairQuizQueryRepoSQL,
        private readonly pairQuizRepoSQL: PairQuizRepoSQL,
        private readonly usersQueryRepoSQL: UsersQueryRepoSQL,
    ) {
    }

    async execute(command: ConnectToQuizCommand): Promise<Result<PairViewModel>> {
        // Проверяем наличие существующей пары
        let activePair = await this.pairQuizQueryRepoSQL.findActivePair(command.userId)

        if(activePair) {
            return {
                resultCode: ResultCode.success,
                data: activePair,
            }
        }

        // Если пары нет - надо создавать
        const user = await this.usersQueryRepoSQL.findUserById(command.userId)
        if(!user){
            return {
                resultCode: ResultCode.internalServerError,
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
                resultCode: ResultCode.internalServerError,
                data: null,
                errorMessage: 'Не удалось создать пару',
            };
        }

        return {
            resultCode: ResultCode.success,
            data: activePair,
        }


    }
}
