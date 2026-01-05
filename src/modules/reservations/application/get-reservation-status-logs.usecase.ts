import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import { RESERVATION_STATUS_LOG_REPOSITORY } from '@core/ports/tokens';
import type { IReservationStatusLogRepository } from '@core/ports/reservation-status-log.repository.port';
import { ReservationStatusLog } from '../domain/reservation-status-log.entity';

export class GetReservationStatusLogsInput {
  reservationId: string;
  skip?: number;
  take?: number;
}

export class GetReservationStatusLogsOutput {
  data: ReservationStatusLog[];
  total: number;
  skip: number;
  take: number;
}

@Injectable()
export class GetReservationStatusLogsUseCase
  implements IUseCase<GetReservationStatusLogsInput, GetReservationStatusLogsOutput>
{
  constructor(
    @Inject(RESERVATION_STATUS_LOG_REPOSITORY)
    private readonly statusLogRepository: IReservationStatusLogRepository,
  ) {}

  async execute(
    input: GetReservationStatusLogsInput,
  ): Promise<GetReservationStatusLogsOutput> {
    const skip = input.skip || 0;
    const take = input.take || 20;

    const result = await this.statusLogRepository.findByReservationIdPaginated(
      input.reservationId,
      skip,
      take,
    );

    return {
      data: result.data,
      total: result.total,
      skip,
      take,
    };
  }
}
