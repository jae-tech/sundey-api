import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IReservationRepository } from '@core/ports/reservation.repository.port';
import { RESERVATION_REPOSITORY } from '@core/ports/tokens';
import { Reservation } from '../domain/reservation.entity';
import { ReservationGateway } from '../interface/reservation.gateway';

export class MarkReservationPaidInput {
  reservationId: string;
  paidAmount: number;
  paymentNote?: string;
}

@Injectable()
export class MarkReservationPaidUseCase implements IUseCase<
  MarkReservationPaidInput,
  Reservation
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly reservationGateway: ReservationGateway,
  ) {}

  async execute(input: MarkReservationPaidInput): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(
      input.reservationId,
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const newPaidAmount = reservation.paidAmount + input.paidAmount;
    const isPaid = newPaidAmount >= reservation.totalPrice;

    const updated = await this.reservationRepository.update(
      input.reservationId,
      {
        paidAmount: newPaidAmount,
        isPaid,
        paymentNote: input.paymentNote,
      },
    );

    // WebSocket으로 결제 정보 업데이트 브로드캐스트
    this.reservationGateway.broadcastReservationPaymentUpdated(
      updated.companyId,
      updated,
    );

    return updated;
  }
}
