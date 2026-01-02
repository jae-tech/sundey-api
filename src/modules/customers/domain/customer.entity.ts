import { BaseEntity } from '@core/base.entity';

export class Customer extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  companyId: string;

  constructor(
    id: string,
    name: string,
    phone: string,
    companyId: string,
    email: string | undefined,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.companyId = companyId;
  }
}
