import { BaseEntity } from '@core/base.entity';
import { ReservationStatus } from './reservation.entity';

/**
 * 예약 상태 변경 로그 엔티티
 * 예약의 상태 변경 이력을 추적하고, 누가 언제 어떻게 변경했는지 기록
 */
export class ReservationStatusLog extends BaseEntity {
  reservationId: string;
  previousStatus: ReservationStatus;
  newStatus: ReservationStatus;
  changedByUserId: string;
  reason?: string;

  constructor(
    id: string,
    reservationId: string,
    previousStatus: ReservationStatus,
    newStatus: ReservationStatus,
    changedByUserId: string,
    createdAt: Date,
    reason?: string,
  ) {
    super(id, createdAt, createdAt);
    this.reservationId = reservationId;
    this.previousStatus = previousStatus;
    this.newStatus = newStatus;
    this.changedByUserId = changedByUserId;
    this.reason = reason;
  }

  /**
   * 로그 요약 텍스트 생성
   */
  getSummary(): string {
    return `상태 변경: ${this.previousStatus} → ${this.newStatus}`;
  }
}
