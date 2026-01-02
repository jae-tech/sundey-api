import { Injectable } from '@nestjs/common';
import { PrismaService as PrismaClient } from '@modules/queue/infrastructure/prisma.service';
import { IServiceRepository } from '@core/ports/service.repository.port';
import { Service } from '../domain/service.entity';
import { ServiceMapper } from './service.mapper';

@Injectable()
export class PrismaServiceAdapter implements IServiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Service | null> {
    const result = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!result) return null;
    return ServiceMapper.toDomain(result);
  }

  async findByCompanyId(companyId: string): Promise<Service[]> {
    const results = await this.prisma.service.findMany({
      where: { companyId },
    });

    return results.map((result) => ServiceMapper.toDomain(result));
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    duration: number;
    companyId: string;
  }): Promise<Service> {
    const result = await this.prisma.service.create({
      data,
    });

    return ServiceMapper.toDomain(result);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      duration: number;
    }>,
  ): Promise<Service> {
    const result = await this.prisma.service.update({
      where: { id },
      data,
    });

    return ServiceMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.service.delete({ where: { id } });
  }
}
