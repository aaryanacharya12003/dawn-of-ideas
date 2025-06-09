
import { z } from 'zod';

export const pgFormSchema = z.object({
  name: z.string().min(1, 'PG name is required'),
  type: z.enum(['male', 'female', 'unisex'], { required_error: 'PG type is required' }),
  location: z.string().min(1, 'Location is required'),
  contactInfo: z.string().min(1, 'Contact info is required'),
  totalRooms: z.coerce.number().min(1, 'Total rooms must be at least 1'),
  totalBeds: z.coerce.number().min(1, 'Total beds must be at least 1'),
  floors: z.coerce.number().min(1, 'Floors must be at least 1'),
  managerId: z.string().optional(),
  images: z.array(z.string()).optional().default([])
});

export type PGFormValues = z.infer<typeof pgFormSchema>;
