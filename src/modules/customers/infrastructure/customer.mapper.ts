import { Customer as PrismaCustomer } from '@prisma-client';
import { Customer } from '../domain/customer.entity';

export class CustomerMapper {
  static toDomain(raw: PrismaCustomer): Customer {
    const customer = raw;
    return new Customer(
      customer.id,
      customer.name,
      customer.phone,
      customer.companyId,
      customer.email ?? undefined,
      customer.createdAt,
      customer.updatedAt,
    );
  }
}
