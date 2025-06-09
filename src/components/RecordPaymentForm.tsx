
import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Student, PaymentMode } from '@/types';
import { paymentFormSchema, PaymentFormValues } from './payment/paymentFormSchema';
import StudentSelectField from './payment/StudentSelectField';
import StudentPaymentInfo from './payment/StudentPaymentInfo';
import DatePickerField from './payment/DatePickerField';
import AmountField from './payment/AmountField';
import PaymentModeField from './payment/PaymentModeField';
import NoteField from './payment/NoteField';

interface RecordPaymentFormProps {
  onSubmit: (studentId: string, paymentData: { date: Date; amount: number; mode: PaymentMode; note: string }) => void;
  onCancel: () => void;
  students: Student[];
}

const RecordPaymentForm: React.FC<RecordPaymentFormProps> = ({ onSubmit, onCancel, students }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      studentId: '',
      date: new Date(),
      amount: '' as unknown as number,
      mode: 'Cash',
      note: '',
    },
  });

  useEffect(() => {
    // Check for suggested amount and selected student from localStorage
    const suggestedAmount = localStorage.getItem('suggestedAmount');
    const selectedStudentId = localStorage.getItem('selectedStudentId');
    
    if (suggestedAmount) {
      form.setValue('amount', suggestedAmount as unknown as number);
      localStorage.removeItem('suggestedAmount');
    }
    
    if (selectedStudentId) {
      form.setValue('studentId', selectedStudentId);
      const student = students.find(s => s.id === selectedStudentId);
      if (student) setSelectedStudent(student);
      localStorage.removeItem('selectedStudentId');
    }
  }, []);

  const handleFormSubmit = (data: PaymentFormValues) => {
    onSubmit(data.studentId, {
      date: data.date,
      amount: data.amount,
      mode: data.mode as PaymentMode,
      note: data.note || '',
    });
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student || null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <StudentSelectField
          name="studentId"
          label="Student"
          students={students}
          onStudentChange={handleStudentChange}
        />

        {selectedStudent && <StudentPaymentInfo student={selectedStudent} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePickerField name="date" label="Date" />
          <AmountField name="amount" label="Amount (₹)" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PaymentModeField name="mode" label="Payment Mode" />
          <NoteField name="note" label="Note" />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Record Payment</Button>
        </div>
      </form>
    </Form>
  );
};

export default RecordPaymentForm;
