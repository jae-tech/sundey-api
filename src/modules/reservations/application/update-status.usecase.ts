import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IReservationRepository } from '@core/ports/reservation.repository.port';
import { RESERVATION_REPOSITORY } from '@core/ports/tokens';
import { Reservation, ReservationStatus } from '../domain/reservation.entity';
import { ReservationGateway } from '../interface/reservation.gateway';

export class UpdateReservationStatusInput {
  reservationId: string;
  status: ReservationStatus;
}

@Injectable()
export class UpdateReservationStatusUseCase implements IUseCase<
  UpdateReservationStatusInput,
  Reservation
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly reservationGateway: ReservationGateway,
  ) {}

  async execute(input: UpdateReservationStatusInput): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(
      input.reservationId,
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    reservation.validateTransition(input.status);

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

    const updated = await this.reservationRepository.update(
      input.reservationId,
      updateData,
    );

    // WebSocket으로 실시간 업데이트 브로드캐스트
    this.reservationGateway.broadcastReservationStatusChanged(
      updated.companyId,
      updated,
    );

    return updated;
  }
}
