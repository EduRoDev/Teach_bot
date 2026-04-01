import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateTokenInterface, PayloadTokenInterface, RevokeTokenInterface } from './interfaces';

@Injectable()
export class TokensService {
    private readonly randomToken = () => Math.floor(1000000 + Math.random() * 900000).toString();

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async generateToken({
        userId,
        ttl = 900000,
        type
    }: CreateTokenInterface) {
        return await this.cacheManager.set(`token:${type}:user:${userId}`, { userId, type, token: this.randomToken() }, ttl);
    }


    async validateToken({
        userId,
        type,
        token
    }: PayloadTokenInterface) {
        const payload: PayloadTokenInterface | undefined = await this.cacheManager.get<PayloadTokenInterface>(`token:${type}:user:${userId}`);
        if (!payload || payload.token !== token) {
            throw new UnauthorizedException('invalid or expired token')
        }

        return payload
    }


    async revokeToken({
        userId,
        type }: RevokeTokenInterface) {
        return await this.cacheManager.del(`token:${type}:user:${userId}`);
    }
}
