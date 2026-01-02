import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IServiceRepository } from '@core/ports/service.repository.port';
import { SERVICE_REPOSITORY } from '@core/ports/tokens';
import { Service } from '../domain/service.entity';

export class GetServicesByCompanyInput {
  companyId: string;
}

@Injectable()
export class GetServicesByCompanyUseCase implements IUseCase<
  GetServicesByCompanyInput,
  Service[]
> {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(input: GetServicesByCompanyInput): Promise<Service[]> {
    return this.serviceRepository.findByCompanyId(input.companyId);
  }
}
