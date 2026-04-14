import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { PrismaModule } from './modules/prisma/prisma.module';
import { envs } from './config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailsModule } from './modules/notifications/emails/emails.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { SubjectModule } from './modules/education/subject/subject.module';
import { GatewayAiModule } from './modules/gateway-ai/gateway-ai.module';
import { DocumentsModule } from './modules/education/documents/documents.module';
import { SummaryModule } from './modules/education/summary/summary.module';
import { FlashcardsModule } from './modules/education/flashcards/flashcards.module';
import { QuizModule } from './modules/education/quiz/quiz.module';
import { ChatModule } from './modules/education/chat/chat.module';
import { PlanModule } from './modules/education/plan/plan.module';
import { AdminModule } from './modules/admin/admin.module';
import { VideosModule } from './modules/education/videos/videos.module';

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
    QuizModule,
    ChatModule,
    PlanModule,
    AdminModule,
    VideosModule
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
