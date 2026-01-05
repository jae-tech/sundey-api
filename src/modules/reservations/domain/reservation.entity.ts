import { BaseEntity } from '@core/base.entity';
import { BusinessException } from '@common/exceptions/business.exception';
import { HttpStatus } from '@nestjs/common';
import { ReservationItem, ReservationMetadata } from './reservation-item.interface';

export enum ReservationStatus {
  PENDING_INQUIRY = 'PENDING_INQUIRY',
  CONFIRMED = 'CONFIRMED',
  WORKING = 'WORKING',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class Reservation extends BaseEntity {
  companyId: string;
  customerId?: string;
  serviceId?: string;
  assignedUserId?: string;
  status: ReservationStatus;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  totalPrice: number;
  paidAmount: number;
  isPaid: boolean;
  paymentNote?: string;
  items: ReservationItem[];
  metadata: ReservationMetadata;

  constructor(
    id: string,
    companyId: string,
    status: ReservationStatus,
    scheduledAt: Date,
    customerName: string,
    customerPhone: string,
    totalPrice: number,
    paidAmount: number,
    isPaid: boolean,
    createdAt: Date,
    updatedAt: Date,
    customerId?: string,
    serviceId?: string,
    assignedUserId?: string,
    startedAt?: Date,
    completedAt?: Date,
    customerEmail?: string,
    paymentNote?: string,
    items: ReservationItem[] = [],
    metadata: ReservationMetadata = {},
  ) {
    super(id, createdAt, updatedAt);
    this.companyId = companyId;
    this.customerId = customerId;
    this.serviceId = serviceId;
    this.assignedUserId = assignedUserId;
    this.status = status;
    this.scheduledAt = scheduledAt;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.customerName = customerName;
    this.customerPhone = customerPhone;
    this.customerEmail = customerEmail;
    this.totalPrice = totalPrice;
    this.paidAmount = paidAmount;
    this.isPaid = isPaid;
    this.paymentNote = paymentNote;
    this.items = items;
    this.metadata = metadata;
  }

  canTransitionTo(newStatus: ReservationStatus): boolean {
    const transitions: Record<ReservationStatus, ReservationStatus[]> = {
      [ReservationStatus.PENDING_INQUIRY]: [
        ReservationStatus.CONFIRMED,
        ReservationStatus.CANCELLED,
      ],
      [ReservationStatus.CONFIRMED]: [
        ReservationStatus.WORKING,
        ReservationStatus.CANCELLED,
        ReservationStatus.NO_SHOW,
      ],
      [ReservationStatus.WORKING]: [
        ReservationStatus.DONE,
        ReservationStatus.CANCELLED,
      ],
      [ReservationStatus.DONE]: [],
      [ReservationStatus.CANCELLED]: [],
      [ReservationStatus.NO_SHOW]: [],
    };

    return transitions[this.status]?.includes(newStatus) || false;
  }

  validateTransition(newStatus: ReservationStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new BusinessException(
        `Cannot transition from ${this.status} to ${newStatus}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  getRemainingAmount(): number {
    return this.totalPrice - this.paidAmount;
  }

  isFullyPaid(): boolean {
    return this.paidAmount >= this.totalPrice;
  }

  /**
   * items 배열에서 총 가격 계산
   */
  calculateItemsTotal(): number {
    return this.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }

  /**
   * items 배열에 항목 추가
   */
  addItem(item: ReservationItem): void {
    const existingItem = this.items.find((i) => i.serviceId === item.serviceId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.items.push(item);
    }
  }

  /**
   * items 배열에서 특정 서비스 제거
   */
  removeItem(serviceId: string): void {
    this.items = this.items.filter((item) => item.serviceId !== serviceId);
  }

  /**
   * metadata 값 설정
   */
  setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  /**
   * metadata 값 조회
   */
  getMetadata(key: string): any {
    return this.metadata[key];
  }
}
