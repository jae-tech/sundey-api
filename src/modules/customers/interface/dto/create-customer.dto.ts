import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).describe('Customer name'),
  phone: z.string().min(1, { message: 'Phone number is required' }).describe('Customer phone number'),
  email: z.string().email({ message: 'Invalid email address' }).optional().describe('Customer email address'),
  companyId: z.string().min(1, { message: 'Company ID is required' }).describe('Company ID'),
});

export class CreateCustomerDto extends createZodDto(CreateCustomerSchema) {}
