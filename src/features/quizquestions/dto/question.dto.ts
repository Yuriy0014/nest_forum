import {IsBoolean, IsNotEmpty, IsString, Length, Matches} from "class-validator";

export class inputQuestionCreateDTO {
    @IsString()
    @Length(10, 500)
    @IsNotEmpty()
    @Matches(/.*\S+.*/, {
        message: 'name should not consist of whitespace characters',
    })
        body: string;
    
    correctAnswers: string[]
}

export class QuestionCreateDTO {
    body: string
    correctAnswers: string[]
    published: boolean
    createdAt: Date
}

export class inputQuestionUpdateDTO {
    @IsString()
    @Length(10, 500)
    @IsNotEmpty()
    @Matches(/.*\S+.*/, {
        message: 'name should not consist of whitespace characters',
    })
        body: string;

    correctAnswers: string[]
}

export class QuestionUpdateDTO {
    body: string;
    correctAnswers: string[];
    updatedAt: Date
}

export class inputQuestionPublishStatusDTO {
    @IsBoolean()
        published: boolean
}