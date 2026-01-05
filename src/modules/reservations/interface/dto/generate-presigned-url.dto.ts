import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GeneratePresignedUrlSchema = z.object({
  fileName: z.string().min(1, { message: 'File name is required' }).describe('File name to upload'),
  mimeType: z.string().min(1, { message: 'MIME type is required' }).describe('MIME type of the file (image/jpeg, image/png, image/webp, image/heic)'),
  type: z.enum(['before', 'after'], {
    errorMap: () => ({ message: 'Type must be either "before" or "after"' })
  }).describe('Type of photo (before or after cleaning)'),
});

export class GeneratePresignedUrlDto extends createZodDto(GeneratePresignedUrlSchema) {}
