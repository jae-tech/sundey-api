import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IReservationRepository } from '@core/ports/reservation.repository.port';
import { RESERVATION_REPOSITORY } from '@core/ports/tokens';
import { Reservation } from '../domain/reservation.entity';
import { ReservationGateway } from '../interface/reservation.gateway';

export class CreateReservationInput {
  companyId: string;
  serviceId: string;
  scheduledAt: Date;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  totalPrice: number;
}

@Injectable()
export class CreateReservationUseCase implements IUseCase<
  CreateReservationInput,
  Reservation
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly reservationGateway: ReservationGateway,
  ) {}

  async execute(input: CreateReservationInput): Promise<Reservation> {
    const created = await this.reservationRepository.create({
      companyId: input.companyId,
      serviceId: input.serviceId,
      scheduledAt: input.scheduledAt,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      totalPrice: input.totalPrice,
      status: 'PENDING_INQUIRY',
    });

    // WebSocket으로 예약 생성 브로드캐스트
    this.reservationGateway.broadcastReservationCreated(
      input.companyId,
      created,
    );

    return created;
  }
}
