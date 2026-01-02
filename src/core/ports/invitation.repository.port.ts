import { Invitation } from '@modules/invitations/domain/invitation.entity';

export interface IInvitationRepository {
  findById(id: string): Promise<Invitation | null>;
  findByToken(token: string): Promise<Invitation | null>;
  findByCompanyId(companyId: string): Promise<Invitation[]>;
  create(data: {
    email: string;
    role: string;
    companyId: string;
    token: string;
    expiresAt: Date;
  }): Promise<Invitation>;
  markAsUsed(id: string): Promise<Invitation>;
  delete(id: string): Promise<void>;
}
