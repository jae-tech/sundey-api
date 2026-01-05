import { User as PrismaUser } from '@prisma/client';
import { User } from '../domain/user.entity';

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return new User(
      raw.id,
      raw.email,
      raw.password,
      raw.name,
      raw.role,
      raw.companyId,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
