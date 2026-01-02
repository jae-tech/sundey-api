import { Injectable } from '@nestjs/common';
import { ReservationStatus as PrismaReservationStatus } from '@prisma-client';
import { PrismaService } from '@modules/queue/infrastructure/prisma.service';
import { IReservationRepository } from '@core/ports/reservation.repository.port';
import { Reservation } from '../domain/reservation.entity';
import { ReservationMapper } from './reservation.mapper';

@Injectable()
export class PrismaReservationAdapter implements IReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Reservation | null> {
    const result = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!result) return null;
    return ReservationMapper.toDomain(result);
  }

  async findByCompanyId(companyId: string): Promise<Reservation[]> {
    const results = await this.prisma.reservation.findMany({
      where: { companyId },
    });

    return results.map((result) => ReservationMapper.toDomain(result));
  }

  async findByCustomerId(customerId: string): Promise<Reservation[]> {
    const results = await this.prisma.reservation.findMany({
      where: { customerId },
    });

    return results.map((result) => ReservationMapper.toDomain(result));
  }

  async findUnpaidByCompanyId(companyId: string): Promise<Reservation[]> {
    const results = await this.prisma.reservation.findMany({
      where: {
        companyId,
        isPaid: false,
      },
    });

    return results.map((result) => ReservationMapper.toDomain(result));
  }

  async create(data: {
    companyId: string;
    serviceId: string;
    scheduledAt: Date;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    totalPrice: number;
    status?: string;
  }): Promise<Reservation> {
    const result = await this.prisma.reservation.create({
      data: {
        companyId: data.companyId,
        serviceId: data.serviceId,
        scheduledAt: data.scheduledAt,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        totalPrice: data.totalPrice,
        status: (data.status as PrismaReservationStatus) || 'PENDING_INQUIRY',
      },
    });

    return ReservationMapper.toDomain(result);
  }

  async update(
    id: string,
    data: Partial<{
      customerId: string;
      assignedUserId: string;
      status: string;
      startedAt: Date;
      completedAt: Date;
      paidAmount: number;
      isPaid: boolean;
      paymentNote: string;
    }>,
  ): Promise<Reservation> {
    const updateData: Partial<{
      customerId: string;
      assignedUserId: string;
      status: PrismaReservationStatus;
      startedAt: Date;
      completedAt: Date;
      paidAmount: number;
      isPaid: boolean;
      paymentNote: string;
    }> = {};

    if (data.customerId !== undefined) updateData.customerId = data.customerId;
    if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId;
    if (data.status !== undefined) updateData.status = data.status as PrismaReservationStatus;
    if (data.startedAt !== undefined) updateData.startedAt = data.startedAt;
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;
    if (data.paidAmount !== undefined) updateData.paidAmount = data.paidAmount;
    if (data.isPaid !== undefined) updateData.isPaid = data.isPaid;
    if (data.paymentNote !== undefined) updateData.paymentNote = data.paymentNote;

    const result = await this.prisma.reservation.update({
      where: { id },
      data: updateData,
    });

    return ReservationMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reservation.delete({ where: { id } });
  }
}
