import { ReservationStatusLog } from '@modules/reservations/domain/reservation-status-log.entity';

/**
 * 예약 상태 변경 로그 저장소 포트
 * 상태 변경 이력 데이터 접근 추상화
 */
export interface IReservationStatusLogRepository {
  /**
   * 새로운 상태 변경 로그 생성
   */
  create(data: {
    reservationId: string;
    previousStatus: string;
    newStatus: string;
    changedByUserId: string;
    reason?: string;
  }): Promise<ReservationStatusLog>;

  /**
   * ID로 로그 조회
   */
  findById(id: string): Promise<ReservationStatusLog | null>;

  /**
   * 예약의 모든 상태 변경 로그 조회
   */
  findByReservationId(reservationId: string): Promise<ReservationStatusLog[]>;

  /**
   * 예약의 상태 변경 로그 페이지네이션 조회
   */
  findByReservationIdPaginated(
    reservationId: string,
    skip: number,
    take: number,
  ): Promise<{
    data: ReservationStatusLog[];
    total: number;
  }>;

  /**
   * 모든 로그 삭제 (예약 삭제 시)
   */
  deleteByReservationId(reservationId: string): Promise<void>;
}
