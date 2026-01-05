import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import { PrismaService } from '@modules/common/infrastructure/prisma/prisma.service';
import type { IReservationRepository } from '@core/ports/reservation.repository.port';
import { RESERVATION_REPOSITORY, RESERVATION_STATUS_LOG_REPOSITORY } from '@core/ports/tokens';
import type { IReservationStatusLogRepository } from '@core/ports/reservation-status-log.repository.port';
import { Reservation, ReservationStatus } from '../domain/reservation.entity';
import { ReservationGateway } from '../interface/reservation.gateway';

export class UpdateReservationStatusInput {
  reservationId: string;
  status: ReservationStatus;
  userId: string;
  reason?: string;
}

@Injectable()
export class UpdateReservationStatusUseCase implements IUseCase<
  UpdateReservationStatusInput,
  Reservation
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(RESERVATION_STATUS_LOG_REPOSITORY)
    private readonly statusLogRepository: IReservationStatusLogRepository,
    private readonly reservationGateway: ReservationGateway,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: UpdateReservationStatusInput): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(
      input.reservationId,
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    reservation.validateTransition(input.status);

    // Prisma transaction으로 원자적 처리
    // Note: PrismaService는 lazy initialization을 사용하므로 getClient()로 클라이언트를 얻음
    const prismaClient = this.prisma.getClient();

    const updated = await prismaClient.$transaction(async (tx) => {
      // 1. 예약 상태 변경
      const updateData: Partial<{
        status: string;
        startedAt: Date;
        completedAt: Date;
      }> = { status: input.status };

      if (input.status === ReservationStatus.WORKING) {
        updateData.startedAt = new Date();
      } else if (input.status === ReservationStatus.DONE) {
        updateData.completedAt = new Date();
      }

      const updatedReservation = await tx.reservation.update({
        where: { id: input.reservationId },
        data: updateData,
      });

      // 2. 상태 변경 로그 기록
      const { v4: uuid } = await import('uuid');
      await tx.reservationStatusLog.create({
        data: {
          id: uuid(),
          reservationId: input.reservationId,
          previousStatus: reservation.status,
          newStatus: input.status,
          changedByUserId: input.userId,
          reason: input.reason,
        },
      });

      return updatedReservation;
    });

    // 3. 도메인 엔티티로 변환
    const updatedDomain = await this.reservationRepository.findById(
      input.reservationId,
    );

    // 4. WebSocket으로 실시간 업데이트 브로드캐스트
    if (updatedDomain) {
      this.reservationGateway.broadcastReservationStatusChanged(
        updatedDomain.companyId,
        updatedDomain,
      );
    }

    return updatedDomain!;
  }
}
