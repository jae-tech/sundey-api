import { Invitation as PrismaInvitation } from '@prisma/client';
import { Invitation } from '../domain/invitation.entity';

export class InvitationMapper {
  static toDomain(raw: PrismaInvitation): Invitation {
    const invitation = raw;
    return new Invitation(
      invitation.id,
      invitation.token,
      invitation.email,
      invitation.role,
      invitation.companyId,
      invitation.isUsed,
      invitation.expiresAt,
      invitation.createdAt,
      invitation.updatedAt,
    );
  }
}
