import { Service } from '@modules/services/domain/service.entity';

export interface IServiceRepository {
  findById(id: string): Promise<Service | null>;
  findByCompanyId(companyId: string): Promise<Service[]>;
  create(data: {
    name: string;
    description?: string;
    price: number;
    duration: number;
    companyId: string;
  }): Promise<Service>;
  update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      duration: number;
    }>,
  ): Promise<Service>;
  delete(id: string): Promise<void>;
}
