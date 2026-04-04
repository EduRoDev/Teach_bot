import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { SubjectModule } from '../subject/subject.module';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [
    PrismaModule,
    SubjectModule
  ],
  providers: [DocumentsService],
  exports: [DocumentsService],
  controllers: [DocumentsController]

})
export class DocumentsModule { }
