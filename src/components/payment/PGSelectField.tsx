
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext, Control } from 'react-hook-form';
import { PG } from '@/types';

interface PGSelectFieldProps {
  name: string;
  label: string;
  pgs: PG[];
  onPGChange?: (pgId: string) => void;
  control?: Control<any>;
}

const PGSelectField: React.FC<PGSelectFieldProps> = ({ 
  name, 
  label, 
  pgs, 
  onPGChange,
  control
}) => {
  const formContext = useFormContext();
  const formControl = control || (formContext ? formContext.control : undefined);
  
  if (!formControl) {
    console.error("PGSelectField: No form control provided");
    return null;
  }
  
  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              if (onPGChange) {
                onPGChange(value);
              }
            }}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select PG" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {pgs.length > 0 ? (
                pgs.map(pg => (
                  <SelectItem key={pg.id} value={pg.id}>
                    {pg.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-pgs-available" disabled>No PGs available</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PGSelectField;
