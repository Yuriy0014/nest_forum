import {answerStatus, gameStatus} from "../entities/quiz-pair.entities";

export class Answer {
    questionId: string;
    answerStatus: answerStatus;
    addedAt: string;
}

type PlayerProgress = {
    answers: Answer[];
    player: {
        id: string;
        login: string;
    };
    score: number;
};

export class Question {
    id: string;
    body: string;
}

export class PairViewModel {
    id: string;
    firstPlayerProgress: PlayerProgress
    secondPlayerProgress: PlayerProgress;
    questions: Question[];
    status: gameStatus;
    pairCreatedDate: string;
    startGameDate: string;
    finishGameDate: string;

}