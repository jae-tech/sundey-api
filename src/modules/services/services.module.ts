import { Module } from '@nestjs/common';
import { SERVICE_REPOSITORY } from '@core/ports/tokens';
import { PrismaServiceAdapter } from './infrastructure/prisma-service.adapter';
import { CreateServiceUseCase } from './application/create-service.usecase';
import { GetServicesByCompanyUseCase } from './application/get-services-by-company.usecase';
import { ServiceController } from './interface/service.controller';

@Module({
  controllers: [ServiceController],
  providers: [
    {
      provide: SERVICE_REPOSITORY,
      useClass: PrismaServiceAdapter,
    },
    CreateServiceUseCase,
    GetServicesByCompanyUseCase,
  ],
  exports: [SERVICE_REPOSITORY],
})
export class ServicesModule {}
