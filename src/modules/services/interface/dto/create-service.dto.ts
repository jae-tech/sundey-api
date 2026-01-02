import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Haircut' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Basic haircut service', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 30000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ example: 'company-uuid' })
  @IsString()
  companyId: string;
}
