'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, FileSpreadsheet, File } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ReportsPage() {
  const user = useUser({ or: 'redirect' });
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWedding();
  }, []);

  async function fetchWedding() {
    try {
      const res = await fetch('/api/weddings');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setWeddingId(data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching wedding:', error);
    }
  }

  async function exportReport(type: 'guests' | 'vendors' | 'budget' | 'tasks' | 'all', format: 'csv' | 'excel' | 'pdf') {
    if (!weddingId) {
      alert('No wedding selected');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/reports/export?weddingId=${weddingId}&type=${type}`);
      const data = await res.json();

      if (!data.success) {
        alert(data.error || 'Failed to generate report');
        setLoading(false);
        return;
      }

      if (format === 'csv' || format === 'excel') {
        exportToExcel(data.data, type, format);
      } else if (format === 'pdf') {
        exportToPDF(data.data, type);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    } finally {
      setLoading(false);
    }
  }

  function exportToExcel(data: any, type: string, format: 'csv' | 'excel') {
    const workbook = XLSX.utils.book_new();

    if (type === 'guests' || type === 'all') {
      if (data.guests && data.guests.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data.guests);
        XLSX.utils.book_append_sheet(workbook, ws, 'Guests');
      }
    }

    if (type === 'vendors' || type === 'all') {
      if (data.vendors && data.vendors.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data.vendors);
        XLSX.utils.book_append_sheet(workbook, ws, 'Vendors');
      }
    }

    if (type === 'budget' || type === 'all') {
      if (data.budget) {
        if (data.budget.categories && data.budget.categories.length > 0) {
          const ws = XLSX.utils.json_to_sheet(data.budget.categories);
          XLSX.utils.book_append_sheet(workbook, ws, 'Budget Categories');
        }
        if (data.budget.expenses && data.budget.expenses.length > 0) {
          const ws = XLSX.utils.json_to_sheet(data.budget.expenses);
          XLSX.utils.book_append_sheet(workbook, ws, 'Expenses');
        }
      }
    }

    if (type === 'tasks' || type === 'all') {
      if (data.tasks && data.tasks.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data.tasks);
        XLSX.utils.book_append_sheet(workbook, ws, 'Tasks');
      }
    }

    const fileName = `wedding-report-${type}-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    
    if (format === 'csv') {
      // For CSV, export first sheet
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      XLSX.writeFile(workbook, fileName, { bookType: 'csv' });
    } else {
      XLSX.writeFile(workbook, fileName);
    }
  }

  function exportToPDF(data: any, type: string) {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text('Wedding Planning Report', 14, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPos);
    yPos += 15;

    if (type === 'guests' || type === 'all') {
      if (data.guests && data.guests.length > 0) {
        doc.setFontSize(16);
        doc.text('Guest List', 14, yPos);
        yPos += 10;

        const tableData = data.guests.map((g: any) => [
          `${g['First Name']} ${g['Last Name']}`,
          g['Email'] || '',
          g['Phone'] || '',
          g['RSVP Status'] || '',
          g['Plus One'] || 'No',
        ]);

        (doc as any).autoTable({
          head: [['Name', 'Email', 'Phone', 'RSVP Status', 'Plus One']],
          body: tableData,
          startY: yPos,
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    }

    if (type === 'vendors' || type === 'all') {
      if (data.vendors && data.vendors.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.text('Vendors', 14, yPos);
        yPos += 10;

        const tableData = data.vendors.map((v: any) => [
          v['Name'] || '',
          v['Category'] || '',
          v['Email'] || '',
          v['Phone'] || '',
          v['Status'] || '',
        ]);

        (doc as any).autoTable({
          head: [['Name', 'Category', 'Email', 'Phone', 'Status']],
          body: tableData,
          startY: yPos,
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    }

    if (type === 'budget' || type === 'all') {
      if (data.budget) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.text('Budget Summary', 14, yPos);
        yPos += 10;

        if (data.budget.expenses && data.budget.expenses.length > 0) {
          const tableData = data.budget.expenses.map((e: any) => [
            e['Description'] || '',
            `₹${e['Amount'] || '0'}`,
            e['Date'] || '',
            e['Payment Method'] || '',
          ]);

          (doc as any).autoTable({
            head: [['Description', 'Amount', 'Date', 'Payment Method']],
            body: tableData,
            startY: yPos,
          });
        }
      }
    }

    const fileName = `wedding-report-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Reports & Export</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Generate and export reports in multiple formats
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Guests Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Guest List Report
                  </CardTitle>
                  <CardDescription>
                    Export guest list with RSVP status and details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => exportReport('guests', 'excel')}
                      disabled={loading}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export Excel
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => exportReport('guests', 'csv')}
                      disabled={loading}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => exportReport('guests', 'pdf')}
                      disabled={loading}
                    >
                      <File className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Vendors Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Vendor Report
                  </CardTitle>
                  <CardDescription>
                    Export vendor list with contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => exportReport('vendors', 'excel')}
                      disabled={loading}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export Excel
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => exportReport('vendors', 'csv')}
                      disabled={loading}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => exportReport('vendors', 'pdf')}
                      disabled={loading}
                    >
                      <File className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Budget Report
                  </CardTitle>
                  <CardDescription>
                    Export budget categories and expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => exportReport('budget', 'excel')}
                      disabled={loading}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export Excel
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => exportReport('budget', 'csv')}
                      disabled={loading}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => exportReport('budget', 'pdf')}
                      disabled={loading}
                    >
                      <File className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tasks Report
                  </CardTitle>
                  <CardDescription>
                    Export task list with status and assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => exportReport('tasks', 'excel')}
                      disabled={loading}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export Excel
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => exportReport('tasks', 'csv')}
                      disabled={loading}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => exportReport('tasks', 'pdf')}
                      disabled={loading}
                    >
                      <File className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Complete Report */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Complete Wedding Report
                  </CardTitle>
                  <CardDescription>
                    Export all data in a comprehensive report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => exportReport('all', 'excel')}
                      disabled={loading}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export Complete Excel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => exportReport('all', 'pdf')}
                      disabled={loading}
                    >
                      <File className="mr-2 h-4 w-4" />
                      Export Complete PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
