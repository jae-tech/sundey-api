import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IInvitationRepository } from '@core/ports/invitation.repository.port';
import { INVITATION_REPOSITORY } from '@core/ports/tokens';
import { Invitation } from '../domain/invitation.entity';
import { randomUUID } from 'crypto';

export class CreateInvitationInput {
  email: string;
  role: string;
  companyId: string;
}

@Injectable()
export class CreateInvitationUseCase implements IUseCase<
  CreateInvitationInput,
  Invitation
> {
  constructor(
    @Inject(INVITATION_REPOSITORY)
    private readonly invitationRepository: IInvitationRepository,
  ) {}

  async execute(input: CreateInvitationInput): Promise<Invitation> {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    return this.invitationRepository.create({
      email: input.email,
      role: input.role,
      companyId: input.companyId,
      token,
      expiresAt,
    });
  }
}
