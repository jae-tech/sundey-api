import { Injectable, Inject } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IReservationRepository } from '@core/ports/reservation.repository.port';
import { RESERVATION_REPOSITORY } from '@core/ports/tokens';
import { Reservation } from '../domain/reservation.entity';

export class GetUnpaidReservationsInput {
  companyId: string;
}

@Injectable()
export class GetUnpaidReservationsUseCase implements IUseCase<
  GetUnpaidReservationsInput,
  Reservation[]
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(input: GetUnpaidReservationsInput): Promise<Reservation[]> {
    return this.reservationRepository.findUnpaidByCompanyId(input.companyId);
  }
}
