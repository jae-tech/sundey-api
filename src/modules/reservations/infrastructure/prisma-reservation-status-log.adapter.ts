import { Injectable } from '@nestjs/common';
import { IReservationStatusLogRepository } from '@core/ports/reservation-status-log.repository.port';
import { PrismaService } from '@modules/common/infrastructure/prisma/prisma.service';
import { ReservationStatusLog } from '../domain/reservation-status-log.entity';
import { ReservationStatusLogMapper } from './reservation-status-log.mapper';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PrismaReservationStatusLogAdapter
  implements IReservationStatusLogRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    reservationId: string;
    previousStatus: string;
    newStatus: string;
    changedByUserId: string;
    reason?: string;
  }): Promise<ReservationStatusLog> {
    const result = await this.prisma.getClient().reservationStatusLog.create({
      data: {
        id: uuid(),
        reservationId: data.reservationId,
        previousStatus: data.previousStatus,
        newStatus: data.newStatus,
        changedByUserId: data.changedByUserId,
        reason: data.reason,
      },
    });

    return ReservationStatusLogMapper.toDomain(result);
  }

  async findById(id: string): Promise<ReservationStatusLog | null> {
    const result = await this.prisma
      .getClient()
      .reservationStatusLog.findUnique({
        where: { id },
      });

    if (!result) return null;
    return ReservationStatusLogMapper.toDomain(result);
  }

  async findByReservationId(
    reservationId: string,
  ): Promise<ReservationStatusLog[]> {
    const results = await this.prisma
      .getClient()
      .reservationStatusLog.findMany({
        where: { reservationId },
        orderBy: { createdAt: 'asc' },
      });

    return results.map((result) => ReservationStatusLogMapper.toDomain(result));
  }

  async findByReservationIdPaginated(
    reservationId: string,
    skip: number,
    take: number,
  ): Promise<{ data: ReservationStatusLog[]; total: number }> {
    const [results, total] = await Promise.all([
      this.prisma
        .getClient()
        .reservationStatusLog.findMany({
          where: { reservationId },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
      this.prisma.getClient().reservationStatusLog.count({
        where: { reservationId },
      }),
    ]);

    return {
      data: results.map((result) => ReservationStatusLogMapper.toDomain(result)),
      total,
    };
  }

  async deleteByReservationId(reservationId: string): Promise<void> {
    await this.prisma.getClient().reservationStatusLog.deleteMany({
      where: { reservationId },
    });
  }
}
