import { Module } from '@nestjs/common';
import { BcryptModule } from './bcrypt/bcrypt.module';
import { SessionsModule } from './sessions/sessions.module';
import { TokensModule } from './tokens/tokens.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategys/jwt.strategy';
import { RefreshStrategy } from './strategys/refresh.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailsModule } from '../emails/emails.module';
import { jwtFunctions } from 'src/common/class/jwt.class';
import { GoogleStrategy } from './strategys/google-auth.strategy';
import { GoogleAuthGuard } from './guards/google.guard';

@Module({
  imports: [
    PrismaModule,
    BcryptModule,
    SessionsModule,
    TokensModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    UsersModule,
    EmailsModule
  ],

  providers: [
    JwtStrategy,
    RefreshStrategy,
    JwtAuthGuard,
    RefreshGuard,
    AuthService,
    jwtFunctions,
    GoogleStrategy,
    GoogleAuthGuard
  ],

  exports: [
    JwtAuthGuard,
    RefreshGuard,
    JwtModule
  ],

  controllers: [AuthController]

})
export class AuthModule { }
