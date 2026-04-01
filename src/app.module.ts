import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { PrismaModule } from './modules/prisma/prisma.module';
import { envs } from './config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailsModule } from './modules/emails/emails.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          ttl: 5000,
          stores: [
            new KeyvRedis(envs.REDIS_URL),
          ],
        };
      },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    EmailsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
