import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportColumn {
  header: string;
  accessor: string;
  format?: (value: any) => string;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  columns: ExportColumn[];
  data: any[];
}

/**
 * Export data to CSV format
 */
export function exportToCSV({ filename, columns, data }: ExportOptions): void {
  const headers = columns.map(col => col.header);
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.accessor];
      return col.format ? col.format(value) : (value ?? '');
    })
  );

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to Excel format
 */
export function exportToExcel({ filename, title, columns, data }: ExportOptions): void {
  const worksheetData = [
    columns.map(col => col.header),
    ...data.map(row =>
      columns.map(col => {
        const value = row[col.accessor];
        return col.format ? col.format(value) : (value ?? '');
      })
    )
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, title || 'Export');

  // Auto-size columns
  const colWidths = columns.map((col, i) => ({
    wch: Math.max(
      col.header.length,
      ...data.map(row => String(row[col.accessor] ?? '').length)
    )
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export data to PDF format
 */
export function exportToPDF({ filename, title, columns, data }: ExportOptions): void {
  const doc = new jsPDF();
  
  // Title
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }

  // Table
  const tableData = data.map(row =>
    columns.map(col => {
      const value = row[col.accessor];
      return col.format ? col.format(value) : String(value ?? '');
    })
  );

  doc.autoTable({
    head: [columns.map(col => col.header)],
    body: tableData,
    startY: title ? 25 : 15,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`${filename}.pdf`);
}

/**
 * Helper function to download a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Format date for export
 */
export function formatExportDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Format currency for export
 */
export function formatExportCurrency(value: number | null | undefined): string {
  if (value == null) return '';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

/**
 * Format boolean for export
 */
export function formatExportBoolean(value: boolean | null | undefined): string {
  if (value == null) return '';
  return value ? 'Oui' : 'Non';
}
