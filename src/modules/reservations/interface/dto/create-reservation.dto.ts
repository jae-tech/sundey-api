import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateReservationSchema = z.object({
  companyId: z
    .string()
    .min(1, { message: 'Company ID is required' })
    .describe('Company ID'),
  services: z
    .array(
      z.object({
        serviceId: z.string().min(1, { message: 'Service ID is required' }),
        quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }).optional().default(1),
      }),
    )
    .min(1, { message: 'At least one service is required' })
    .describe('Services with quantity'),
  scheduledAt: z.coerce
    .date({ message: 'Invalid date format' })
    .describe('Scheduled date and time'),
  customerName: z
    .string()
    .min(1, { message: 'Customer name is required' })
    .describe('Customer name'),
  customerPhone: z
    .string()
    .min(1, { message: 'Customer phone is required' })
    .describe('Customer phone number'),
  customerEmail: z.string().optional().describe('Customer email address'),
  metadata: z
    .record(z.any())
    .optional()
    .describe('Optional metadata for the reservation'),
});

export class CreateReservationDto extends createZodDto(CreateReservationSchema) {}
