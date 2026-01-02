import { Customer } from '@modules/customers/domain/customer.entity';

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByPhone(phone: string, companyId: string): Promise<Customer | null>;
  findByCompanyId(companyId: string): Promise<Customer[]>;
  create(data: {
    name: string;
    phone: string;
    email?: string;
    companyId: string;
  }): Promise<Customer>;
  update(
    id: string,
    data: Partial<{
      name: string;
      phone: string;
      email: string;
    }>,
  ): Promise<Customer>;
  delete(id: string): Promise<void>;
}
