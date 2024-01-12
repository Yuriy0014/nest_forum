export class QuestionCreateDTO {
    body: string
    correctAnswers: string[]
}

export class QuestionUpdateDTO {
    body: string
    correctAnswers: string[]
}

export class QuestionPublishStatusDTO {
    published: boolean
}