import { Module } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from '@core/ports/tokens';
import { PrismaCustomerAdapter } from './infrastructure/prisma-customer.adapter';
import { CreateCustomerUseCase } from './application/create-customer.usecase';
import { GetCustomersByCompanyUseCase } from './application/get-customers-by-company.usecase';
import { CustomerController } from './interface/customer.controller';

@Module({
  controllers: [CustomerController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerAdapter,
    },
    CreateCustomerUseCase,
    GetCustomersByCompanyUseCase,
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersModule {}
