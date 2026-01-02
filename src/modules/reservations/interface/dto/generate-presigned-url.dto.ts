import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePresignedUrlDto {
  @ApiProperty({
    example: 'photo.jpg',
    description: 'File name to upload',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    example: 'image/jpeg',
    description:
      'MIME type of the file (image/jpeg, image/png, image/webp, image/heic)',
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({
    enum: ['before', 'after'],
    example: 'before',
    description: 'Type of photo (before or after cleaning)',
  })
  @IsEnum(['before', 'after'])
  @IsNotEmpty()
  type: 'before' | 'after';
}
