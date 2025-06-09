
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { Student } from '@/types';

interface StudentSelectFieldProps {
  name: string;
  label: string;
  students: Student[];
  onStudentChange: (studentId: string) => void;
}

const StudentSelectField: React.FC<StudentSelectFieldProps> = ({ 
  name, 
  label, 
  students, 
  onStudentChange 
}) => {
  const form = useFormContext();
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              onStudentChange(value);
            }}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {students.length > 0 ? (
                students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-students-available" disabled>No students available</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StudentSelectField;
