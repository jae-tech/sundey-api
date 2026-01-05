import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).describe('User email address'),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).describe('User password'),
});

export class LoginDto extends createZodDto(LoginSchema) {}
