import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CreateCustomerUseCase } from '../application/create-customer.usecase';
import { GetCustomersByCompanyUseCase } from '../application/get-customers-by-company.usecase';
import { CreateCustomerDto } from './dto/create-customer.dto';

@ApiTags('고객')
@ApiBearerAuth('JWT')
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomersByCompanyUseCase: GetCustomersByCompanyUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: '고객 등록',
    description: '새로운 고객을 등록합니다.',
  })
  async createCustomer(@Body() dto: CreateCustomerDto) {
    return this.createCustomerUseCase.execute(dto);
  }

  @Get('company/:companyId')
  @ApiOperation({
    summary: '고객 목록',
    description: '특정 회사의 모든 고객 목록을 조회합니다.',
  })
  async getCustomersByCompany(@Param('companyId') companyId: string) {
    return this.getCustomersByCompanyUseCase.execute({ companyId });
  }
}
