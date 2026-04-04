import { Module } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule
  ],
  providers: [SubjectService],
  controllers: [SubjectController],
  exports: [SubjectService]
})
export class SubjectModule { }
