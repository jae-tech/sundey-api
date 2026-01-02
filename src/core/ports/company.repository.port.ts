import { Company } from '@modules/users/domain/company.entity';

export interface ICompanyRepository {
  findById(id: string): Promise<Company | null>;
  create(data: { name: string }): Promise<Company>;
  update(id: string, data: Partial<{ name: string }>): Promise<Company>;
  delete(id: string): Promise<void>;
}
