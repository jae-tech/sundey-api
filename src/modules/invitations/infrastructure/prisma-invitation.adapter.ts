import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma-client';
import { PrismaService } from '@modules/queue/infrastructure/prisma.service';
import { IInvitationRepository } from '@core/ports/invitation.repository.port';
import { Invitation } from '../domain/invitation.entity';
import { InvitationMapper } from './invitation.mapper';

@Injectable()
export class PrismaInvitationAdapter implements IInvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Invitation | null> {
    const result = await this.prisma.invitation.findUnique({
      where: { id },
    });

    if (!result) return null;
    return InvitationMapper.toDomain(result);
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const result = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!result) return null;
    return InvitationMapper.toDomain(result);
  }

  async findByCompanyId(companyId: string): Promise<Invitation[]> {
    const results = await this.prisma.invitation.findMany({
      where: { companyId },
    });

    return results.map((result) => InvitationMapper.toDomain(result));
  }

  async create(data: {
    email: string;
    role: string;
    companyId: string;
    token: string;
    expiresAt: Date;
  }): Promise<Invitation> {
    const role = data.role as UserRole;
    const result = await this.prisma.invitation.create({
      data: {
        email: data.email,
        role,
        companyId: data.companyId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });

    return InvitationMapper.toDomain(result);
  }

  async markAsUsed(id: string): Promise<Invitation> {
    const result = await this.prisma.invitation.update({
      where: { id },
      data: { isUsed: true },
    });

    return InvitationMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.invitation.delete({ where: { id } });
  }
}
