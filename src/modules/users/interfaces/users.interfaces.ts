import { AuthProviderEnum, UserRoleEnum, UserStatusEnum } from "@prisma/client"


export interface CreateUserInterface {
    name?: string
    lastName?: string
    avatar?: string
    email: string
    backupEmail?: string
    phone?: string
    password?: string
    country?: string

    emailConfirm?: boolean
    backupEmailConfirm?: boolean
    phoneConfirm?: boolean

    twoFactorEnabled?: boolean
    twoFactorSecret?: string

    status?: UserStatusEnum
    authProvider?: AuthProviderEnum
    role?: UserRoleEnum
}

export interface UpdateUserInterface {
    id: number
    name?: string
    lastName?: string
    avatar?: string
    email?: string
    backupEmail?: string
    phone?: string
    password?: string
    country?: string

    emailConfirm?: boolean
    backupEmailConfirm?: boolean
    phoneConfirm?: boolean

    twoFactorEnabled?: boolean
    twoFactorSecret?: string

    status?: UserStatusEnum
    authProvider?: AuthProviderEnum
    role?: UserRoleEnum
}

