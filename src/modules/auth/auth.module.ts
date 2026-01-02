import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@modules/users/users.module';
import { LoginUseCase } from './application/login.usecase';
import { RegisterUseCase } from './application/register.usecase';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { AuthController } from './interface/auth.controller';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({}), ConfigModule],
  controllers: [AuthController],
  providers: [LoginUseCase, RegisterUseCase, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
