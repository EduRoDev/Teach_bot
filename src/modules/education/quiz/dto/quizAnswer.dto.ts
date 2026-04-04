import { IsInt, IsString } from "class-validator";

export class QuizAnswerDto {

    @IsInt()
    questionId!: number;

    @IsString()
    selectedOption!: string;
}