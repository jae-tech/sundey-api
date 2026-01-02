import { Module } from '@nestjs/common';
import { UsersModule } from '@modules/users/users.module';
import { INVITATION_REPOSITORY } from '@core/ports/tokens';
import { PrismaInvitationAdapter } from './infrastructure/prisma-invitation.adapter';
import { CreateInvitationUseCase } from './application/create-invitation.usecase';
import { AcceptInvitationUseCase } from './application/accept-invitation.usecase';
import { InvitationController } from './interface/invitation.controller';

@Module({
  imports: [UsersModule],
  controllers: [InvitationController],
  providers: [
    {
      provide: INVITATION_REPOSITORY,
      useClass: PrismaInvitationAdapter,
    },
    CreateInvitationUseCase,
    AcceptInvitationUseCase,
  ],
  exports: [INVITATION_REPOSITORY],
})
export class InvitationsModule {}
