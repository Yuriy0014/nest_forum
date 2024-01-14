import {ActivePairEntity, answerStatus, gameStatus} from "../entities/quiz-pair.entities";

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

export class addSecondPlayerDTO {
    pairId: string
    secondPlayerId: string
    secondPlayerLogin: string
    status: gameStatus
    startGameDate: Date
    firstQuestionId: string
}

export class answerStatusUpdateDTO {
    activePair: ActivePairEntity
    questionNumber: number
    playerNumber: number
    answerStatus: answerStatus
    answerDate: Date
}

export class addNewQuestionId {
    activePair: ActivePairEntity
    newQuestionId: string
    questionNumber: number
}

export class endGameDTO {
    activePair: ActivePairEntity
    finishGameDate: Date
    endStatus: gameStatus.end
}