import { Company as PrismaCompany } from '@prisma-client';
import { Company } from '../domain/company.entity';

export class CompanyMapper {
  static toDomain(raw: PrismaCompany): Company {
    return new Company(raw.id, raw.name, raw.createdAt, raw.updatedAt);
  }
}
