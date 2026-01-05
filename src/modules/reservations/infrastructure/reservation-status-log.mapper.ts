import { ReservationStatusLog as PrismaReservationStatusLog } from '@prisma/client';
import {
  ReservationStatusLog,
  ReservationStatus,
} from '../domain/reservation-status-log.entity';

export class ReservationStatusLogMapper {
  /**
   * Prisma 모델 → Domain Entity
   */
  static toDomain(raw: PrismaReservationStatusLog): ReservationStatusLog {
    return new ReservationStatusLog(
      raw.id,
      raw.reservationId,
      raw.previousStatus as ReservationStatus,
      raw.newStatus as ReservationStatus,
      raw.changedByUserId,
      raw.createdAt,
      raw.reason ?? undefined,
    );
  }

  /**
   * Domain Entity → Prisma Create Input
   */
  static toPrisma(entity: ReservationStatusLog) {
    return {
      id: entity.id,
      reservationId: entity.reservationId,
      previousStatus: entity.previousStatus,
      newStatus: entity.newStatus,
      changedByUserId: entity.changedByUserId,
      reason: entity.reason,
    };
  }
}
