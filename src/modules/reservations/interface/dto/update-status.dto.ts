import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ReservationStatus } from '../../domain/reservation.entity';

export const UpdateStatusSchema = z.object({
  status: z.nativeEnum(ReservationStatus, {
    errorMap: () => ({ message: 'Invalid reservation status' })
  }).describe('Reservation status'),
});

export class UpdateStatusDto extends createZodDto(UpdateStatusSchema) {}
