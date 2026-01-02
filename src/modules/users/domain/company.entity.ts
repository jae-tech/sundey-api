import { BaseEntity } from '@core/base.entity';

export class Company extends BaseEntity {
  name: string;

  constructor(id: string, name: string, createdAt: Date, updatedAt: Date) {
    super(id, createdAt, updatedAt);
    this.name = name;
  }
}
