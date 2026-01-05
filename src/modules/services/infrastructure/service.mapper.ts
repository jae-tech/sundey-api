import { Service as PrismaService } from '@prisma/client';
import { Service } from '../domain/service.entity';

export class ServiceMapper {
  static toDomain(raw: PrismaService): Service {
    return new Service(
      raw.id,
      raw.name,
      raw.description,
      raw.price,
      raw.duration,
      raw.companyId,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
