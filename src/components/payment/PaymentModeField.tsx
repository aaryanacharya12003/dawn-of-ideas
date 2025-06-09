
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext, Control } from 'react-hook-form';

interface PaymentModeFieldProps {
  name?: string;
  label?: string;
  control?: Control<any>;
}

const PaymentModeField: React.FC<PaymentModeFieldProps> = ({ 
  name = "mode", 
  label = "Payment Mode", 
  control 
}) => {
  const formContext = useFormContext();
  const formControl = control || (formContext ? formContext.control : undefined);
  
  if (!formControl) {
    console.error("PaymentModeField: No form control provided");
    return null;
  }
  
  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PaymentModeField;
