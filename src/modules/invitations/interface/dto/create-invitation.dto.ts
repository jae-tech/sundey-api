import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateInvitationSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).describe('Invitee email address'),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF'], {
    errorMap: () => ({ message: 'Role must be one of: OWNER, MANAGER, STAFF' })
  }).describe('User role'),
  companyId: z.string().min(1, { message: 'Company ID is required' }).describe('Company ID'),
});

export class CreateInvitationDto extends createZodDto(CreateInvitationSchema) {}
