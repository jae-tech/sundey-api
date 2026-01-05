import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const MarkPaidSchema = z.object({
  paidAmount: z.number().min(0, { message: 'Paid amount must be non-negative' }).describe('Amount paid'),
  paymentNote: z.string().optional().describe('Payment note'),
});

export class MarkPaidDto extends createZodDto(MarkPaidSchema) {}
