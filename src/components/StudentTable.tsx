
import React from 'react';
import { Button } from '@/components/ui/button';
import { Student } from '@/types';
import { format } from 'date-fns';
import { Trash2, CreditCard, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

interface StudentTableProps {
  students: Student[];
  onRemoveStudent: (studentId: string) => void;
  onDeleteStudent?: (studentId: string) => void;
  onSelectStudent: (student: Student) => void;
  loading?: boolean;
  pgId?: string; // Optional parameter to identify which PG these students belong to
}

const StudentTable: React.FC<StudentTableProps> = ({ 
  students, 
  onRemoveStudent, 
  onDeleteStudent,
  onSelectStudent,
  loading = false,
  pgId
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user has permission to delete students (only admin)
  const hasDeletePermission = () => {
    if (!user) return false;
    
    // Only admins can delete students
    return user.role === 'admin';
  };

  const handleRemoveClick = (student: Student) => {
    if (window.confirm(`Are you sure you want to remove ${student.name} from this room?`)) {
      onRemoveStudent(student.id);
    }
  };

  const handleDeleteClick = (student: Student) => {
    if (window.confirm(`Are you sure you want to permanently delete ${student.name}? This action cannot be undone and will remove all associated payment records.`)) {
      console.log('StudentTable: Deleting student:', student.id, student.name);
      onDeleteStudent?.(student.id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Students</h3>
        <div className="border rounded-md">
          <div className="p-4">
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Students</h3>
      
      {students && students.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="hidden md:table-cell">Start Date</TableHead>
                <TableHead className="hidden md:table-cell">End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.phone || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {student.startDate ? format(new Date(student.startDate), 'dd/MM/yyyy') : "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {student.endDate ? format(new Date(student.endDate), 'dd/MM/yyyy') : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectStudent(student)}
                        title="View/Add Payment"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      {hasDeletePermission() && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => handleRemoveClick(student)}
                            title="Remove from room"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteClick(student)}
                            title="Delete permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-medium">No Students</h4>
          <p className="text-sm text-muted-foreground mt-1">
            This room currently has no students assigned to it.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
