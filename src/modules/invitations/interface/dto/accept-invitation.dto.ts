import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AcceptInvitationSchema = z.object({
  token: z.string().min(1, { message: 'Token is required' }).describe('Invitation token'),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).describe('User password'),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).describe('User full name'),
});

export class AcceptInvitationDto extends createZodDto(AcceptInvitationSchema) {}
