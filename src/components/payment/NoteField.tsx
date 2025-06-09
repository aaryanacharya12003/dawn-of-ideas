
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext, Control } from 'react-hook-form';

interface NoteFieldProps {
  name?: string;
  label?: string;
  control?: Control<any>;
}

const NoteField: React.FC<NoteFieldProps> = ({ 
  name = "note", 
  label = "Note", 
  control 
}) => {
  const formContext = useFormContext();
  const formControl = control || (formContext ? formContext.control : undefined);
  
  if (!formControl) {
    console.error("NoteField: No form control provided");
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
            <Input placeholder="Optional note" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NoteField;
