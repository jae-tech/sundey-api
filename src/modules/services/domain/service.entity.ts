import { BaseEntity } from '@core/base.entity';

export class Service extends BaseEntity {
  name: string;
  description: string;
  price: number;
  duration: number;
  companyId: string;

  constructor(
    id: string,
    name: string,
    description: string,
    price: number,
    duration: number,
    companyId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.description = description;
    this.price = price;
    this.duration = duration;
    this.companyId = companyId;
  }
}
