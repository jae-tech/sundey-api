import { Reservation as PrismaReservation } from '@prisma-client';
import { Reservation, ReservationStatus } from '../domain/reservation.entity';

export class ReservationMapper {
  static toDomain(raw: PrismaReservation): Reservation {
    return new Reservation(
      raw.id,
      raw.companyId,
      raw.serviceId,
      raw.status as ReservationStatus,
      raw.scheduledAt,
      raw.customerName,
      raw.customerPhone,
      raw.totalPrice,
      raw.paidAmount,
      raw.isPaid,
      raw.createdAt,
      raw.updatedAt,
      raw.customerId ?? undefined,
      raw.assignedUserId ?? undefined,
      raw.startedAt ?? undefined,
      raw.completedAt ?? undefined,
      raw.customerEmail ?? undefined,
      raw.paymentNote ?? undefined,
    );
  }
}
