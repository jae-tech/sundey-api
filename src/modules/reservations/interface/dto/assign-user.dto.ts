import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignUserDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  assignedUserId: string;
}
