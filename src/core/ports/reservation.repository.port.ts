import { Reservation } from '@modules/reservations/domain/reservation.entity';

import { ReservationItem, ReservationMetadata } from '@modules/reservations/domain/reservation-item.interface';

export interface IReservationRepository {
  findById(id: string): Promise<Reservation | null>;
  findByCompanyId(companyId: string): Promise<Reservation[]>;
  findByCustomerId(customerId: string): Promise<Reservation[]>;
  findUnpaidByCompanyId(companyId: string): Promise<Reservation[]>;
  create(data: {
    companyId: string;
    serviceId?: string; // 하위호환성을 위해 유지
    scheduledAt: Date;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    totalPrice: number;
    items?: ReservationItem[];
    metadata?: ReservationMetadata;
    status?: string;
  }): Promise<Reservation>;
  update(
    id: string,
    data: Partial<{
      customerId: string;
      assignedUserId: string;
      status: string;
      startedAt: Date;
      completedAt: Date;
      paidAmount: number;
      isPaid: boolean;
      paymentNote: string;
      items: ReservationItem[];
      metadata: ReservationMetadata;
    }>,
  ): Promise<Reservation>;
  delete(id: string): Promise<void>;
}
