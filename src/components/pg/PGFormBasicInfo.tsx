
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { PGFormValues } from './types';

interface PGFormBasicInfoProps {
  form: UseFormReturn<PGFormValues>;
}

const PGFormBasicInfo: React.FC<PGFormBasicInfoProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PG Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter PG name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PG Type</FormLabel>
              <Select 
                value={field.value || 'male'}
                onValueChange={(value) => {
                  console.log('PGFormBasicInfo: PG Type changing from', field.value, 'to:', value);
                  field.onChange(value);
                  form.trigger('type');
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PG type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter full address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="contactInfo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Information</FormLabel>
            <FormControl>
              <Input placeholder="Phone number or email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="floors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Floors</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="totalRooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Rooms</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="totalBeds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Beds</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default PGFormBasicInfo;
