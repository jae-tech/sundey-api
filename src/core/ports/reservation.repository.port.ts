import { Reservation } from '@modules/reservations/domain/reservation.entity';

export interface IReservationRepository {
  findById(id: string): Promise<Reservation | null>;
  findByCompanyId(companyId: string): Promise<Reservation[]>;
  findByCustomerId(customerId: string): Promise<Reservation[]>;
  findUnpaidByCompanyId(companyId: string): Promise<Reservation[]>;
  create(data: {
    companyId: string;
    serviceId: string;
    scheduledAt: Date;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    totalPrice: number;
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
    }>,
  ): Promise<Reservation>;
  delete(id: string): Promise<void>;
}
