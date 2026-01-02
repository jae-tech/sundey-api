import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { ICustomerRepository } from '@core/ports/customer.repository.port';
import { CUSTOMER_REPOSITORY } from '@core/ports/tokens';
import { Customer } from '../domain/customer.entity';

export class CreateCustomerInput {
  name: string;
  phone: string;
  email?: string;
  companyId: string;
}

@Injectable()
export class CreateCustomerUseCase implements IUseCase<
  CreateCustomerInput,
  Customer
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(input: CreateCustomerInput): Promise<Customer> {
    const existing = await this.customerRepository.findByPhone(
      input.phone,
      input.companyId,
    );
    if (existing) {
      throw new ConflictException('Customer with this phone already exists');
    }

    return this.customerRepository.create(input);
  }
}
