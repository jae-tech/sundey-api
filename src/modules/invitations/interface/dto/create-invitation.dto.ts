import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsIn } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'STAFF', enum: ['OWNER', 'MANAGER', 'STAFF'] })
  @IsString()
  @IsIn(['OWNER', 'MANAGER', 'STAFF'])
  role: string;

  @ApiProperty({ example: 'company-uuid' })
  @IsString()
  companyId: string;
}
