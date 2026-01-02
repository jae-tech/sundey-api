import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IUserRepository } from '@core/ports/user.repository.port';
import type { ICompanyRepository } from '@core/ports/company.repository.port';
import { USER_REPOSITORY, COMPANY_REPOSITORY } from '@core/ports/tokens';
import { HashUtil } from '@common/utils/hash.util';

export class RegisterInput {
  email: string;
  password: string;
  name: string;
  companyName: string;
}

export class RegisterOutput {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

@Injectable()
export class RegisterUseCase implements IUseCase<
  RegisterInput,
  RegisterOutput
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const company = await this.companyRepository.create({
      name: input.companyName,
    });

    const hashedPassword = await HashUtil.hash(input.password);

    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: 'OWNER',
      companyId: company.id,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    };
  }
}
