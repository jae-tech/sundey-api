import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class MarkPaidDto {
  @ApiProperty({ example: 30000 })
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @ApiProperty({ example: 'Cash payment', required: false })
  @IsString()
  @IsOptional()
  paymentNote?: string;
}
