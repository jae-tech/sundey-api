import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateServiceSchema = z.object({
  name: z.string().min(1, { message: 'Service name is required' }).describe('Service name'),
  description: z.string().optional().describe('Service description'),
  price: z.number().min(0, { message: 'Price must be non-negative' }).describe('Service price'),
  duration: z.number().min(1, { message: 'Duration must be at least 1 minute' }).describe('Duration in minutes'),
  companyId: z.string().min(1, { message: 'Company ID is required' }).describe('Company ID'),
});

export class CreateServiceDto extends createZodDto(CreateServiceSchema) {}
