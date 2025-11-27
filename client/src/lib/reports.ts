/**
 * Utilitaires pour l'export de données (CSV, Excel, PDF)
 */

import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Exporte des données en CSV
 */
export function exportToCSV(
  data: any[],
  headers: string[],
  filename: string,
  getRowData: (item: any) => any[]
): void {
  const rows = data.map(item => getRowData(item));
  const csv = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        const cellStr = String(cell ?? '');
        // Échapper les guillemets et entourer de guillemets si nécessaire
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Exporte des données en format texte (TXT)
 */
export function exportToTXT(
  data: any[],
  headers: string[],
  filename: string,
  getRowData: (item: any) => any[],
  separator: string = '\t'
): void {
  const rows = data.map(item => getRowData(item));
  const txt = [
    headers.join(separator),
    ...rows.map(row => row.map(cell => String(cell ?? '')).join(separator))
  ].join('\n');

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Formate un montant en euros depuis des centimes
 */
export function formatEuros(cents: number): string {
  if (cents === 0) return "0,00 €";
  const euros = cents / 100;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(euros);
}

/**
 * Formate une date pour l'export
 */
export function formatDateForExport(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM/yyyy', { locale: fr });
}

/**
 * Formate une date et heure pour l'export
 */
export function formatDateTimeForExport(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM/yyyy HH:mm', { locale: fr });
}

/**
 * Valide que les données ne sont pas vides avant export
 */
export function validateExportData(data: any[]): { valid: boolean; error?: string } {
  if (!data || data.length === 0) {
    return { valid: false, error: 'Aucune donnée à exporter' };
  }
  return { valid: true };
}

