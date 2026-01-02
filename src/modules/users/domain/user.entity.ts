import { BaseEntity } from '@core/base.entity';

export class User extends BaseEntity {
  email: string;
  password: string;
  name: string;
  role: string;
  companyId: string;

  constructor(
    id: string,
    email: string,
    password: string,
    name: string,
    role: string,
    companyId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.password = password;
    this.name = name;
    this.role = role;
    this.companyId = companyId;
  }

  isOwner(): boolean {
    return this.role === 'OWNER';
  }

  isManager(): boolean {
    return this.role === 'MANAGER';
  }

  isStaff(): boolean {
    return this.role === 'STAFF';
  }
}
