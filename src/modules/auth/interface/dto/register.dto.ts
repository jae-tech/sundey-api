import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).describe('User email address'),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).describe('User password'),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).describe('User full name'),
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters' }).describe('Company name'),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
