import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IReservationRepository } from '@core/ports/reservation.repository.port';
import type { ICustomerRepository } from '@core/ports/customer.repository.port';
import {
  RESERVATION_REPOSITORY,
  CUSTOMER_REPOSITORY,
} from '@core/ports/tokens';
import { Reservation, ReservationStatus } from '../domain/reservation.entity';
import { ReservationGateway } from '../interface/reservation.gateway';

export class ConfirmReservationInput {
  reservationId: string;
}

@Injectable()
export class ConfirmReservationUseCase implements IUseCase<
  ConfirmReservationInput,
  Reservation
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    private readonly reservationGateway: ReservationGateway,
  ) {}

  async execute(input: ConfirmReservationInput): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(
      input.reservationId,
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    reservation.validateTransition(ReservationStatus.CONFIRMED);

    // Auto-create customer if not exists
    let customer = await this.customerRepository.findByPhone(
      reservation.customerPhone,
      reservation.companyId,
    );

    if (!customer) {
      customer = await this.customerRepository.create({
        name: reservation.customerName,
        phone: reservation.customerPhone,
        email: reservation.customerEmail,
        companyId: reservation.companyId,
      });
    }

    const updated = await this.reservationRepository.update(
      input.reservationId,
      {
        status: ReservationStatus.CONFIRMED,
        customerId: customer.id,
      },
    );

    // WebSocket으로 예약 확정 정보 브로드캐스트
    this.reservationGateway.broadcastReservationStatusChanged(
      updated.companyId,
      updated,
    );

    return updated;
  }
}
