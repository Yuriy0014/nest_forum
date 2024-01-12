import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {ActivePairEntity, FinishedPairEntity} from "./entities/quiz-pair.entities";

@Injectable()
export class PairQuizQueryRepoSQL {
    private activePairRepository: Repository<ActivePairEntity>;
    private finishedPairRepository: Repository<FinishedPairEntity>;

    constructor(@InjectDataSource() protected dataSource: DataSource) {
        this.activePairRepository = dataSource.getRepository(ActivePairEntity);
        this.finishedPairRepository = dataSource.getRepository(FinishedPairEntity);
    }
}