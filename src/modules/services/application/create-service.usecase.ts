import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IServiceRepository } from '@core/ports/service.repository.port';
import { SERVICE_REPOSITORY } from '@core/ports/tokens';
import { Service } from '../domain/service.entity';

export class CreateServiceInput {
  name: string;
  description?: string;
  price: number;
  duration: number;
  companyId: string;
}

@Injectable()
export class CreateServiceUseCase implements IUseCase<
  CreateServiceInput,
  Service
> {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(input: CreateServiceInput): Promise<Service> {
    return this.serviceRepository.create({
      name: input.name,
      description: input.description || '',
      price: input.price,
      duration: input.duration,
      companyId: input.companyId,
    });
  }
}
