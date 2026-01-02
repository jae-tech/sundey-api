import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { ICustomerRepository } from '@core/ports/customer.repository.port';
import { CUSTOMER_REPOSITORY } from '@core/ports/tokens';
import { Customer } from '../domain/customer.entity';

export class GetCustomersByCompanyInput {
  companyId: string;
}

@Injectable()
export class GetCustomersByCompanyUseCase implements IUseCase<
  GetCustomersByCompanyInput,
  Customer[]
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(input: GetCustomersByCompanyInput): Promise<Customer[]> {
    return this.customerRepository.findByCompanyId(input.companyId);
  }
}
