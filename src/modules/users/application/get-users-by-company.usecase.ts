import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IUserRepository } from '@core/ports/user.repository.port';
import { USER_REPOSITORY } from '@core/ports/tokens';
import { User } from '../domain/user.entity';

export class GetUsersByCompanyInput {
  companyId: string;
}

@Injectable()
export class GetUsersByCompanyUseCase implements IUseCase<
  GetUsersByCompanyInput,
  User[]
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: GetUsersByCompanyInput): Promise<User[]> {
    return this.userRepository.findByCompanyId(input.companyId);
  }
}
