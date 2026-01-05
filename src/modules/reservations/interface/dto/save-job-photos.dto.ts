import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PhotoType } from '../../domain/job.entity';

export const PhotoDataSchema = z.object({
  type: z.nativeEnum(PhotoType, {
    errorMap: () => ({ message: 'Invalid photo type' })
  }).describe('Photo type (BEFORE or AFTER)'),
  photoUrl: z.string().url({ message: 'Invalid photo URL' }).describe('Photo URL'),
  fileName: z.string().min(1, { message: 'File name is required' }).describe('File name'),
  uploadedBy: z.string().optional().describe('User ID who uploaded the photo'),
});

export class PhotoDataDto extends createZodDto(PhotoDataSchema) {}

export const SaveJobPhotosSchema = z.object({
  reservationId: z.string().min(1, { message: 'Reservation ID is required' }).describe('Reservation ID'),
  photos: z.array(PhotoDataSchema).min(1, { message: 'At least one photo is required' }).describe('Array of photos'),
});

export class SaveJobPhotosDto extends createZodDto(SaveJobPhotosSchema) {}
