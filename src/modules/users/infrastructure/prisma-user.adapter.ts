import { Injectable } from '@nestjs/common';
import { User as PrismaUser, UserRole } from '@prisma-client';
import { PrismaService } from '@modules/queue/infrastructure/prisma.service';
import { IUserRepository } from '@core/ports/user.repository.port';
import { User } from '../domain/user.entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class PrismaUserAdapter implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const result: PrismaUser | null = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!result) return null;
    return UserMapper.toDomain(result);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result: PrismaUser | null = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!result) return null;
    return UserMapper.toDomain(result);
  }

  async findByCompanyId(companyId: string): Promise<User[]> {
    const results: PrismaUser[] = await this.prisma.user.findMany({
      where: { companyId },
    });

    return results.map((result) => UserMapper.toDomain(result));
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    companyId: string;
  }): Promise<User> {
    const result: PrismaUser = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role as UserRole,
        companyId: data.companyId,
      },
    });

    return UserMapper.toDomain(result);
  }

  async update(
    id: string,
    data: Partial<{
      email: string;
      password: string;
      name: string;
      role: string;
    }>,
  ): Promise<User> {
    const updateData: Partial<{
      email: string;
      password: string;
      name: string;
      role: UserRole;
    }> = {};

    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role as UserRole;

    const result: PrismaUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return UserMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
