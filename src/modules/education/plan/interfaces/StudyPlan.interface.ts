export interface StudyPlanContent {
    objectives: string[];
    recommended_resources: string[];
    schedule: {
        [key: string]: string;
    };
}