export interface CreateSessionInterface {
    id?: string

    userId: number
    refreshToken: string

    userAgent?: string
    ipAddress?: string
    location?: string

    isActive?: boolean

    expiresAt?: string
}

export interface UpdateSessionInterface {
    id: string
    userId: number
    refreshToken: string

    userAgent?: string
    ipAddress?: string
    location?: string

    isActive?: boolean

    expiresAt?: string
}

export interface GetAllSessions {
    userId: number
}

export interface GetSession {
    id: string
    userId: number
}

export interface IGetSessionByParams {
    userId: number,
    ip?: string,
    userAgent?: string,
}