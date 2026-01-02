import { BaseEntity } from '@core/base.entity';

export class Invitation extends BaseEntity {
  token: string;
  email: string;
  role: string;
  companyId: string;
  isUsed: boolean;
  expiresAt: Date;

  constructor(
    id: string,
    token: string,
    email: string,
    role: string,
    companyId: string,
    isUsed: boolean,
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.token = token;
    this.email = email;
    this.role = role;
    this.companyId = companyId;
    this.isUsed = isUsed;
    this.expiresAt = expiresAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  canBeUsed(): boolean {
    return !this.isUsed && !this.isExpired();
  }
}
