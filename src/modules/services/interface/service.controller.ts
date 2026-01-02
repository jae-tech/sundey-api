import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CreateServiceUseCase } from '../application/create-service.usecase';
import { GetServicesByCompanyUseCase } from '../application/get-services-by-company.usecase';
import { CreateServiceDto } from './dto/create-service.dto';

@ApiTags('서비스')
@ApiBearerAuth('JWT')
@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly getServicesByCompanyUseCase: GetServicesByCompanyUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: '서비스 등록',
    description: '새로운 서비스를 등록합니다.',
  })
  async createService(@Body() dto: CreateServiceDto) {
    return this.createServiceUseCase.execute(dto);
  }

  @Get('company/:companyId')
  @ApiOperation({
    summary: '서비스 목록',
    description: '특정 회사의 모든 서비스 목록을 조회합니다.',
  })
  async getServicesByCompany(@Param('companyId') companyId: string) {
    return this.getServicesByCompanyUseCase.execute({ companyId });
  }
}
