import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { PrismaModule } from './modules/prisma/prisma.module';
import { envs } from './config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailsModule } from './modules/emails/emails.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { SubjectModule } from './modules/subject/subject.module';
import { GatewayAiModule } from './modules/gateway-ai/gateway-ai.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SummaryModule } from './modules/summary/summary.module';
import { FlashcardsModule } from './modules/flashcards/flashcards.module';
import { QuizModule } from './modules/quiz/quiz.module';

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
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 6000,
        limit: 100
      }
    ]),
    SubjectModule,
    GatewayAiModule,
    DocumentsModule,
    SummaryModule,
    FlashcardsModule,
    QuizModule
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule { }
