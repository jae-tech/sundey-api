import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { Public } from '@common/decorators/public.decorator';
import { CreateInvitationUseCase } from '../application/create-invitation.usecase';
import { AcceptInvitationUseCase } from '../application/accept-invitation.usecase';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@ApiTags('초대')
@Controller('invitations')
export class InvitationController {
  constructor(
    private readonly createInvitationUseCase: CreateInvitationUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
  ) {}

  @Post()
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @ApiOperation({
    summary: '초대장 생성',
    description: '새로운 직원을 초대합니다. (OWNER 권한 필요)',
  })
  async createInvitation(@Body() dto: CreateInvitationDto) {
    return this.createInvitationUseCase.execute(dto);
  }

  @Public()
  @Post('accept')
  @ApiOperation({
    summary: '초대 수락',
    description: '초대를 수락하고 계정을 생성합니다.',
  })
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.acceptInvitationUseCase.execute(dto);
  }
}
