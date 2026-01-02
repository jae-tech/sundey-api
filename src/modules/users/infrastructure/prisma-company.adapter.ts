import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/queue/infrastructure/prisma.service';
import { ICompanyRepository } from '@core/ports/company.repository.port';
import { Company } from '../domain/company.entity';
import { CompanyMapper } from './company.mapper';

@Injectable()
export class PrismaCompanyAdapter implements ICompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Company | null> {
    const result = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!result) return null;

    return CompanyMapper.toDomain(result);
  }

  async create(data: { name: string }): Promise<Company> {
    const result = await this.prisma.company.create({
      data,
    });

    return CompanyMapper.toDomain(result);
  }

  async update(id: string, data: Partial<{ name: string }>): Promise<Company> {
    const result = await this.prisma.company.update({
      where: { id },
      data,
    });

    return CompanyMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }
}
