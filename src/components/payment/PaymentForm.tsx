
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Banknote } from 'lucide-react';
import { PaymentFormValues, paymentFormSchema } from './paymentFormSchema';
import AmountField from './AmountField';
import DatePickerField from './DatePickerField';
import PaymentModeField from './PaymentModeField';
import NoteField from './NoteField';

interface PaymentFormProps {
  onSubmit: (data: PaymentFormValues) => void;
  disabled?: boolean; // Added disabled prop
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, disabled = false }) => {
  // Use the payment form schema and default values
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      studentId: '', // This will be set by the parent when used in student context
      date: new Date(),
      amount: '' as unknown as number,
      mode: 'Cash',
      note: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DatePickerField name="date" label="Date" control={form.control} />
        <AmountField name="amount" label="Amount" control={form.control} />
        <PaymentModeField name="mode" label="Payment Mode" control={form.control} />
        <NoteField name="note" label="Note" control={form.control} />
        
        <Button type="submit" className="w-full" disabled={disabled}>
          <Banknote className="mr-2 h-4 w-4" /> Record Payment
        </Button>
      </form>
    </Form>
  );
};

export default PaymentForm;
