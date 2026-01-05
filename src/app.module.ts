import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalModule } from './global.module';
import { CommonModule } from '@modules/common/common.module';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { InvitationsModule } from '@modules/invitations/invitations.module';
import { CustomersModule } from '@modules/customers/customers.module';
import { ServicesModule } from '@modules/services/services.module';
import { ReservationsModule } from '@modules/reservations/reservations.module';
import { QueueModule } from '@modules/queue/queue.module';
import appConfig from '@configs/app.config';
import databaseConfig from '@configs/database.config';
import jwtConfig from '@configs/jwt.config';
import redisConfig from '@configs/redis.config';
import { pinoLoggerConfig } from '@configs/logger.config';
import { envValidationSchema } from '@core/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
      validate: (env) => {
        try {
          return envValidationSchema.parse(env);
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`❌ 환경변수 검증 실패: ${error.message}`);
          }
          throw error;
        }
      },
    }),
    LoggerModule.forRootAsync(pinoLoggerConfig()),
    CommonModule,
    GlobalModule,
    QueueModule,
    UsersModule,
    AuthModule,
    InvitationsModule,
    CustomersModule,
    ServicesModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
