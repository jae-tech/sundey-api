import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AssignUserSchema = z.object({
  assignedUserId: z.string().min(1, { message: 'Assigned user ID is required' }).describe('User ID to assign'),
});

export class AssignUserDto extends createZodDto(AssignUserSchema) {}
