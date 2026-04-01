import { AuthorizationTokenEnum } from "src/common/enums";

export interface CreateTokenInterface {
    userId: number;
    type: AuthorizationTokenEnum;
    ttl?: number;
}

export interface PayloadTokenInterface {
    userId: number;
    type: AuthorizationTokenEnum;
    token: string;
}

export interface RevokeTokenInterface {
    userId: number;
    type: AuthorizationTokenEnum;
}

export interface TokenResponseInterface {
    token: string;
}