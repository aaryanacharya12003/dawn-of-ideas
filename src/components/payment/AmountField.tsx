
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext, Control } from 'react-hook-form';

interface AmountFieldProps {
  name?: string;
  label?: string;
  control?: Control<any>;
}

const AmountField: React.FC<AmountFieldProps> = ({ 
  name = "amount", 
  label = "Amount", 
  control 
}) => {
  const formContext = useFormContext();
  const formControl = control || (formContext ? formContext.control : undefined);
  
  if (!formControl) {
    console.error("AmountField: No form control provided");
    return null;
  }
  
  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder="Enter amount" type="number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AmountField;
