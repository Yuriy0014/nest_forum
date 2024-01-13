import {gameStatus} from "../entities/quiz-pair.entities";

export class AnswerDTO {
    answer: string
}

export class createPairDTO {
    firstPlayerId: string
    firstPlayerLogin: string
    pairCreatedDate: Date
    firstPlayerScore: number
    secondPlayerScore: number
    status: gameStatus
}