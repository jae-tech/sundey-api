import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IReservationRepository } from '@core/ports/reservation.repository.port';
import { RESERVATION_REPOSITORY } from '@core/ports/tokens';
import { Reservation } from '../domain/reservation.entity';
import { ReservationGateway } from '../interface/reservation.gateway';

export class AssignUserInput {
  reservationId: string;
  assignedUserId: string;
}

@Injectable()
export class AssignUserUseCase implements IUseCase<
  AssignUserInput,
  Reservation
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly reservationGateway: ReservationGateway,
  ) {}

  async execute(input: AssignUserInput): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(
      input.reservationId,
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const updated = await this.reservationRepository.update(
      input.reservationId,
      {
        assignedUserId: input.assignedUserId,
      },
    );

    // WebSocket으로 담당자 배정 정보 브로드캐스트
    this.reservationGateway.broadcastReservationAssigned(
      updated.companyId,
      updated,
    );

    return updated;
  }
}
