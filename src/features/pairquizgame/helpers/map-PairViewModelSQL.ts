import {Injectable} from '@nestjs/common';
import {ActivePairViewModel, Answer, Question} from "../models/pairquizgame.models";
import {ActivePairEntity} from "../entities/quiz-pair.entities";

@Injectable()
export class MapPairViewModelSQL {
    getPairViewModel = (pair: ActivePairEntity): ActivePairViewModel => {

        const answersPlayer1: Answer[] = [];
        const answersPlayer2: Answer[] = [];
        const questionsArr: Question[] = [];

        // Отбираем только те вопросы, которые уже прислали. У них id !== null
        for (const key in pair) {
            if (key.match(/^question_\d+_id$/) && pair[key] !== null) {
                const questionNum = key.match(/\d+/)![0]; // Извлекаем номер вопроса из ключа
                const player1_answ_date = pair[`question_${questionNum}_player1_answ_date`]
                const player2_answ_date = pair[`question_${questionNum}_player2_answ_date`]
                answersPlayer1.push({
                    questionId: pair[key],
                    answerStatus: pair[`question_${questionNum}_player1_status`],
                    addedAt: player1_answ_date ? player1_answ_date.toISOString() : null
                })

                answersPlayer2.push({
                    questionId: pair[key],
                    answerStatus: pair[`question_${questionNum}_player2_status`],
                    addedAt: player2_answ_date ? player2_answ_date.toISOString() : null
                })

                questionsArr.push({
                    id:  pair[key],
                    body: pair[`question_${questionNum}_body`]
                })
            }

        }

        return {
            id: pair.id,
            firstPlayerProgress: {
                answers: answersPlayer1,
                player: {
                    id: pair.firstPlayerId,
                    login: pair.firstPlayerLogin
                },
                score: pair.firstPlayerScore
            },
            secondPlayerProgress: {
                answers: answersPlayer2,
                player: {
                    id: pair.secondPlayerId,
                    login: pair.secondPlayerLogin
                },
                score: pair.secondPlayerScore
            },
            questions: questionsArr,
            status: pair.status,
            pairCreatedDate: pair.pairCreatedDate.toISOString(),
            startGameDate : pair.startGameDate.toISOString(),
            finishGameDate : pair.finishGameDate.toISOString()
        }
        ;
    };
}
