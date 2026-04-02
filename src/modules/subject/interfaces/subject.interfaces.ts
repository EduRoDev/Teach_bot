export interface createSubjectInterface {
    userId: number,
    name: string,
    description: string
}

export interface updateSubjectInterface {
    userId: number,
    id: number,
    name?: string,
    description?: string
}
