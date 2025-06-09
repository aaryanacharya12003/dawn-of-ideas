
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Payment, Room, Student } from '@/types';

// Extended Payment type with UI-specific fields
interface ExtendedPayment extends Payment {
  studentName?: string;
  roomNumber?: string;
  index?: number;
}

// Function to prepare payment data for export
export const preparePaymentData = (payments: ExtendedPayment[]) => {
  return payments.map(payment => ({
    date: new Date(payment.date).toLocaleDateString(),
    student_name: payment.studentName || 'Unknown',
    room_number: payment.roomNumber || 'Unknown',
    amount: payment.amount,
    payment_mode: payment.mode,
    note: payment.note || '-'
  }));
};

// Export to Excel function
export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  
  // Generate Excel file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Export to PDF function - fixing the signature to match usage
export const exportToPDF = (columns: string[], data: any[], title: string, filename: string) => {
  const doc = new jsPDF();
  
  // Add title to the PDF
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  
  const tableData = data.map(item => columns.map(col => item[col]));
  const tableHeaders = columns.map(col => col.replace(/_/g, ' ').toUpperCase());
  
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 25,
  });
  
  doc.save(`${filename}.pdf`);
};

// Export to CSV function
export const exportToCSV = (data: any[], filename: string) => {
  // Create CSV header
  const headers = Object.keys(data[0] || {});
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      let value = item[header]?.toString() || '';
      // Escape quotes in the value
      if (value.includes(',') || value.includes('"')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
    csv += row + '\n';
  });
  
  // Create and download CSV file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Prepare occupancy data function
export const prepareOccupancyData = (rooms: Room[]) => {
  return rooms.map(room => {
    const occupiedBeds = room.students?.length || 0;
    const availableBeds = room.capacity - occupiedBeds;
    const occupancyRate = room.capacity > 0 ? Math.round((occupiedBeds / room.capacity) * 100) : 0;
    
    return {
      room_number: room.number,
      capacity: room.capacity,
      occupied: occupiedBeds,
      available: availableBeds,
      occupancy_rate: `${occupancyRate}%`
    };
  });
};

// Prepare student data function
export const prepareStudentData = (students: Student[]) => {
  return students.map(student => {
    const roomNumber = student.roomId ? 'Room ' + student.roomId.substring(0, 4) : 'Unknown';
    
    return {
      name: student.name,
      phone: student.phone,
      address: student.address || '-',
      occupation: student.occupation || '-',
      total_fees: student.totalFees,
      deposit: student.deposit,
      start_date: new Date(student.startDate).toLocaleDateString(),
      end_date: new Date(student.endDate).toLocaleDateString(),
      room_number: roomNumber
    };
  });
};

// Prepare financial data function
export const prepareFinancialData = (students: Student[]) => {
  // Calculate total fees and total paid
  let totalFees = 0;
  let totalPaid = 0;
  let totalDue = 0;
  
  // Prepare detailed payment data
  const detailedPayments = students.flatMap(student => {
    const studentPayments = student.payments || [];
    totalFees += student.totalFees;
    const studentPaidAmount = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    totalPaid += studentPaidAmount;
    totalDue += (student.totalFees - studentPaidAmount);
    
    return studentPayments.map(payment => ({
      student_id: student.id,
      student_name: student.name,
      date: new Date(payment.date).toLocaleDateString(),
      amount: payment.amount,
      mode: payment.mode,
      note: payment.note || '-'
    }));
  });
  
  // Prepare summary data
  const summary = {
    totalFees,
    totalPaid,
    totalDue,
    collectionRate: totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0
  };
  
  return {
    summary,
    detailed: detailedPayments
  };
};

// Download JSON data function
export const downloadJsonData = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
