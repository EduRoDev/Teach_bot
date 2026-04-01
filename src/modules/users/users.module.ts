import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BcryptModule } from '../auth/bcrypt/bcrypt.module';

@Module({
  imports: [
    PrismaModule,
    BcryptModule
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: []
})
export class UsersModule { }
