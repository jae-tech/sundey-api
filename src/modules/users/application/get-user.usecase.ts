import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IUserRepository } from '@core/ports/user.repository.port';
import { USER_REPOSITORY } from '@core/ports/tokens';
import { User } from '../domain/user.entity';

export class GetUserInput {
  userId: string;
}

@Injectable()
export class GetUserUseCase implements IUseCase<GetUserInput, User> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: GetUserInput): Promise<User> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
