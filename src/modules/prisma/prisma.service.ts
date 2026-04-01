import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from 'pg';
import { envs } from 'src/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger('App - Leviatan');

    constructor() {
        const pool = new Pool({ connectionString: envs.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        super({ adapter });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Database connected successfully.');
        } catch (error) {
            this.logger.error('Error connecting to Database:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database disconnected successfully.');
    }
}
