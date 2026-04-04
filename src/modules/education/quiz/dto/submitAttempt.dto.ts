import { IsArray, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { QuizAnswerDto } from "./quizAnswer.dto";
import { Type } from 'class-transformer';

export class SubmitAttemptDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type (() => QuizAnswerDto)
    answers!: QuizAnswerDto[]

    @IsOptional()
    @IsNumber()
    timeTaken?: number
}