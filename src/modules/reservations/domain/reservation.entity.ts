import { BaseEntity } from '@core/base.entity';
import { BusinessException } from '@common/exceptions/business.exception';
import { HttpStatus } from '@nestjs/common';

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
  serviceId: string;
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

  constructor(
    id: string,
    companyId: string,
    serviceId: string,
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
    assignedUserId?: string,
    startedAt?: Date,
    completedAt?: Date,
    customerEmail?: string,
    paymentNote?: string,
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
}
