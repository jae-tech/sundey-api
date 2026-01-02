import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@core/types/user.type';
import { GetUserUseCase } from '../application/get-user.usecase';
import { GetUsersByCompanyUseCase } from '../application/get-users-by-company.usecase';

@ApiTags('사용자')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersByCompanyUseCase: GetUsersByCompanyUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: '내 정보 조회',
    description: '현재 로그인한 사용자의 정보를 조회합니다.',
  })
  async getMe(@CurrentUser() user: AuthUser) {
    return this.getUserUseCase.execute({ userId: user.id });
  }

  @Get(':id')
  @ApiOperation({
    summary: '사용자 조회',
    description: 'ID로 특정 사용자 정보를 조회합니다.',
  })
  async getUser(@Param('id') id: string) {
    return this.getUserUseCase.execute({ userId: id });
  }

  @Get('company/:companyId')
  @ApiOperation({
    summary: '회사 직원 목록',
    description: '특정 회사의 모든 직원 목록을 조회합니다.',
  })
  async getUsersByCompany(@Param('companyId') companyId: string) {
    return this.getUsersByCompanyUseCase.execute({ companyId });
  }
}
