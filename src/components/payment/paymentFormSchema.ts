
import * as z from 'zod';

export const paymentFormSchema = z.object({
  studentId: z.string().min(1, { message: "Student is required" }),
  date: z.date(),
  amount: z.string().regex(/^\d+$/).transform(Number),
  mode: z.enum(['Cash', 'UPI', 'Bank Transfer']),
  note: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
