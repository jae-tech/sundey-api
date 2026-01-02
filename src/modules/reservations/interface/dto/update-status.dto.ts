import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReservationStatus } from '../../domain/reservation.entity';

export class UpdateStatusDto {
  @ApiProperty({
    example: 'CONFIRMED',
    enum: ReservationStatus,
  })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
