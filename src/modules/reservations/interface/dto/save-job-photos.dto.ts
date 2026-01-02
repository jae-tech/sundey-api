import { IsArray, IsString, IsEnum, IsOptional } from 'class-validator';
import { PhotoType } from '../../domain/job.entity';

export class PhotoDataDto {
  @IsEnum(PhotoType)
  type: PhotoType;

  @IsString()
  photoUrl: string;

  @IsString()
  fileName: string;

  @IsOptional()
  @IsString()
  uploadedBy?: string;
}

export class SaveJobPhotosDto {
  @IsString()
  reservationId: string;

  @IsArray()
  photos: PhotoDataDto[];
}
