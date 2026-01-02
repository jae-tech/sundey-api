import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IInvitationRepository } from '@core/ports/invitation.repository.port';
import type { IUserRepository } from '@core/ports/user.repository.port';
import { INVITATION_REPOSITORY, USER_REPOSITORY } from '@core/ports/tokens';
import { HashUtil } from '@common/utils/hash.util';

export class AcceptInvitationInput {
  token: string;
  password: string;
  name: string;
}

export class AcceptInvitationOutput {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

@Injectable()
export class AcceptInvitationUseCase implements IUseCase<
  AcceptInvitationInput,
  AcceptInvitationOutput
> {
  constructor(
    @Inject(INVITATION_REPOSITORY)
    private readonly invitationRepository: IInvitationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: AcceptInvitationInput): Promise<AcceptInvitationOutput> {
    const invitation = await this.invitationRepository.findByToken(input.token);
    if (!invitation) {
      throw new BadRequestException('Invalid invitation token');
    }

    if (!invitation.canBeUsed()) {
      throw new BadRequestException('Invitation expired or already used');
    }

    const hashedPassword = await HashUtil.hash(input.password);

    const user = await this.userRepository.create({
      email: invitation.email,
      password: hashedPassword,
      name: input.name,
      role: invitation.role,
      companyId: invitation.companyId,
    });

    await this.invitationRepository.markAsUsed(invitation.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    };
  }
}
