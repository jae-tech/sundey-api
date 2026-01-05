import { BaseEntity } from '@core/base.entity';
import { CustomerMetadata } from './customer-metadata.interface';

export class Customer extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  companyId: string;
  metadata: CustomerMetadata;

  constructor(
    id: string,
    name: string,
    phone: string,
    companyId: string,
    email: string | undefined,
    createdAt: Date,
    updatedAt: Date,
    metadata: CustomerMetadata = {},
  ) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.companyId = companyId;
    this.metadata = metadata;
  }

  /**
   * 메타데이터 값 설정
   */
  setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  /**
   * 메타데이터 값 조회
   */
  getMetadata(key: string): any {
    return this.metadata[key];
  }
}
