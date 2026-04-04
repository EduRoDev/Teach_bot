export interface QuizQuestion {
    question_text: string;
    options: string[];
    correct_option: string;
}

export interface QuizResponse {
    title: string;
    questions: QuizQuestion[];
}

export interface QuizAnswerInput{
    questionId: number;
    selectedOption: string;
}