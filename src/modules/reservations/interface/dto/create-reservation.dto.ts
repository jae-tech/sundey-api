import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ example: 'company-uuid' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'service-uuid' })
  @IsString()
  serviceId: string;

  @ApiProperty({ example: '2025-11-25T10:00:00Z' })
  @IsDateString()
  scheduledAt: Date;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: '010-1234-5678' })
  @IsString()
  customerPhone: string;

  @ApiProperty({ example: 'customer@example.com', required: false })
  @IsString()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ example: 30000 })
  @IsNumber()
  totalPrice: number;
}
