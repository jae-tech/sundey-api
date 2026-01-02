import { User } from '@modules/users/domain/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCompanyId(companyId: string): Promise<User[]>;
  create(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    companyId: string;
  }): Promise<User>;
  update(
    id: string,
    data: Partial<{
      email: string;
      password: string;
      name: string;
      role: string;
    }>,
  ): Promise<User>;
  delete(id: string): Promise<void>;
}
