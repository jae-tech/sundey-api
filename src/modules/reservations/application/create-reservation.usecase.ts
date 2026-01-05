import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IUseCase } from '@core/base.usecase';
import type { IReservationRepository } from '@core/ports/reservation.repository.port';
import type { IServiceRepository } from '@core/ports/service.repository.port';
import { RESERVATION_REPOSITORY, SERVICE_REPOSITORY } from '@core/ports/tokens';
import { Reservation } from '../domain/reservation.entity';
import { ReservationItem, ReservationMetadata } from '../domain/reservation-item.interface';
import { ReservationGateway } from '../interface/reservation.gateway';

export class CreateReservationInput {
  companyId: string;
  services: Array<{ serviceId: string; quantity: number }>;
  scheduledAt: Date;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CreateReservationUseCase implements IUseCase<
  CreateReservationInput,
  Reservation
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    private readonly reservationGateway: ReservationGateway,
  ) {}

  async execute(input: CreateReservationInput): Promise<Reservation> {
    // 1. 서비스 정보 조회 및 items 배열 생성 (스냅샷)
    const items: ReservationItem[] = [];
    let totalPrice = 0;

    for (const serviceInput of input.services) {
      const service = await this.serviceRepository.findById(serviceInput.serviceId);

      if (!service) {
        throw new BadRequestException(
          `Service with ID ${serviceInput.serviceId} not found`,
        );
      }

      // 예약 시점의 가격을 스냅샷으로 저장
      const item: ReservationItem = {
        serviceId: service.id,
        name: service.name,
        price: service.price,
        quantity: serviceInput.quantity,
      };

      items.push(item);
      totalPrice += service.price * serviceInput.quantity;
    }

    // 2. 예약 생성 (items 배열과 자동 계산된 totalPrice 포함)
    const created = await this.reservationRepository.create({
      companyId: input.companyId,
      serviceId: input.services[0]?.serviceId, // 하위호환성을 위해 첫 서비스 저장
      scheduledAt: input.scheduledAt,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      totalPrice,
      items,
      metadata: input.metadata || {},
      status: 'PENDING_INQUIRY',
    });

    // 3. WebSocket으로 예약 생성 브로드캐스트
    this.reservationGateway.broadcastReservationCreated(
      input.companyId,
      created,
    );

    return created;
  }
}
