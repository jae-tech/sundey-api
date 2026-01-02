import { Module } from '@nestjs/common';
import { USER_REPOSITORY, COMPANY_REPOSITORY } from '@core/ports/tokens';
import { PrismaUserAdapter } from './infrastructure/prisma-user.adapter';
import { PrismaCompanyAdapter } from './infrastructure/prisma-company.adapter';
import { GetUserUseCase } from './application/get-user.usecase';
import { GetUsersByCompanyUseCase } from './application/get-users-by-company.usecase';
import { UserController } from './interface/user.controller';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserAdapter,
    },
    {
      provide: COMPANY_REPOSITORY,
      useClass: PrismaCompanyAdapter,
    },
    GetUserUseCase,
    GetUsersByCompanyUseCase,
  ],
  exports: [USER_REPOSITORY, COMPANY_REPOSITORY],
})
export class UsersModule {}
