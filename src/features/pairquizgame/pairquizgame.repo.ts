import {Injectable, InternalServerErrorException} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {ActivePairEntity, FinishedPairEntity} from "./entities/quiz-pair.entities";
import {addSecondPlayerDTO, createPairDTO} from "./dto/quiz.dto";

@Injectable()
export class PairQuizRepoSQL {
    private activePairRepository: Repository<ActivePairEntity>;
    private finishedPairRepository: Repository<FinishedPairEntity>;

    constructor(@InjectDataSource() protected dataSource: DataSource) {
        this.activePairRepository = dataSource.getRepository(ActivePairEntity);
        this.finishedPairRepository = dataSource.getRepository(FinishedPairEntity);
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
            const result =  await this.activePairRepository
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
        } catch(e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }
    }
}


