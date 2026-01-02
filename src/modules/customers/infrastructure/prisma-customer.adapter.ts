import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/queue/infrastructure/prisma.service';
import { ICustomerRepository } from '@core/ports/customer.repository.port';
import { Customer } from '../domain/customer.entity';
import { CustomerMapper } from './customer.mapper';

@Injectable()
export class PrismaCustomerAdapter implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Customer | null> {
    const result = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!result) return null;
    return CustomerMapper.toDomain(result);
  }

  async findByPhone(
    phone: string,
    companyId: string,
  ): Promise<Customer | null> {
    const result = await this.prisma.customer.findUnique({
      where: {
        phone_companyId: {
          phone,
          companyId,
        },
      },
    });

    if (!result) return null;
    return CustomerMapper.toDomain(result);
  }

  async findByCompanyId(companyId: string): Promise<Customer[]> {
    const results = await this.prisma.customer.findMany({
      where: { companyId },
    });

    return results.map((result) => CustomerMapper.toDomain(result));
  }

  async create(data: {
    name: string;
    phone: string;
    email?: string;
    companyId: string;
  }): Promise<Customer> {
    const result = await this.prisma.customer.create({
      data,
    });

    return CustomerMapper.toDomain(result);
  }

  async update(
    id: string,
    data: Partial<{ name: string; phone: string; email: string }>,
  ): Promise<Customer> {
    const result = await this.prisma.customer.update({
      where: { id },
      data,
    });

    return CustomerMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({ where: { id } });
  }
}
