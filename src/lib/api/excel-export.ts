/**
 * Excel Export Utility
 * 
 * Provides functions to export production data to Excel format
 * Supports batch production, route dispatch, shop distribution, and product reports
 * 
 * Usage:
 * import { exportProductionBatches, exportRouteDispatch, exportShopDistribution } from '@/lib/api/excel-export';
 * 
 * await exportProductionBatches(batches, 'production_batches.xlsx');
 */

/**
 * Parse CSV data and create Excel-compatible format
 * This is a simple implementation using JSON to CSV conversion
 * For production, consider using 'xlsx' or 'exceljs' npm package
 * 
 * Install: npm install xlsx
 * 
 * This file provides the wrapper functions for easy usage
 */

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExportData {
  sheetName: string;
  columns: ExcelColumn[];
  data: Record<string, any>[];
}

/**
 * Helper: Convert data to CSV format
 * Returns CSV string that can be converted to Excel
 */
export function dataToCSV(columns: ExcelColumn[], data: Record<string, any>[]): string {
  const headers = columns.map(col => `"${col.header}"`).join(',');
  const rows = data.map(row =>
    columns
      .map(col => {
        const value = row[col.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return `"${value}"`;
      })
      .join(',')
  );
  return [headers, ...rows].join('\n');
}

/**
 * Helper: Download file directly
 */
function downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Format date for Excel
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/**
 * Format currency for Excel
 */
function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '';
  return `$${amount.toFixed(2)}`;
}

/**
 * Export Production Batches
 */
export function exportProductionBatches(
  batches: any[],
  filename: string = 'production_batches_export.csv'
): void {
  const columns: ExcelColumn[] = [
    { header: 'Batch Number', key: 'batch_number', width: 15 },
    { header: 'Batch Code', key: 'batch_code', width: 12 },
    { header: 'Production Date', key: 'production_date', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Created At', key: 'created_at', width: 15 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];

  const data = (batches || []).map(batch => ({
    batch_number: batch.batch_number || '',
    batch_code: batch.batch_code || '',
    production_date: formatDate(batch.production_date),
    status: batch.status || '',
    created_at: formatDate(batch.created_at),
    notes: batch.notes || '',
  }));

  const csv = dataToCSV(columns, data);
  downloadFile(csv, filename);
}

/**
 * Export Route Dispatch Data
 */
export function exportRouteDispatch(
  dispatches: any[],
  filename: string = 'route_dispatch_export.csv'
): void {
  const columns: ExcelColumn[] = [
    { header: 'Dispatch Date', key: 'dispatch_date', width: 15 },
    { header: 'Rider Name', key: 'rider_name', width: 20 },
    { header: 'Rider Phone', key: 'rider_phone', width: 15 },
    { header: 'Product', key: 'product_name', width: 20 },
    { header: 'Quantity Dispatched', key: 'quantity_dispatched', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];

  const data = (dispatches || []).map(dispatch => ({
    dispatch_date: formatDate(dispatch.dispatch_date),
    rider_name: dispatch.rider?.full_name || dispatch.rider_name || '',
    rider_phone: dispatch.rider?.phone || dispatch.rider_phone || '',
    product_name: dispatch.product?.name || dispatch.product_name || '',
    quantity_dispatched: dispatch.quantity_dispatched || 0,
    status: dispatch.status || '',
    notes: dispatch.notes || '',
  }));

  const csv = dataToCSV(columns, data);
  downloadFile(csv, filename);
}

/**
 * Export Shop Distribution Data
 */
export function exportShopDistribution(
  transfers: any[],
  filename: string = 'shop_distribution_export.csv'
): void {
  const columns: ExcelColumn[] = [
    { header: 'Transfer Date', key: 'transfer_date', width: 15 },
    { header: 'Product', key: 'product_name', width: 20 },
    { header: 'Batch ID', key: 'batch_id', width: 20 },
    { header: 'Quantity Transferred', key: 'quantity', width: 15 },
    { header: 'Transferred By', key: 'transferred_by', width: 20 },
    { header: 'Location From', key: 'from_location', width: 15 },
    { header: 'Location To', key: 'to_location', width: 15 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];

  const data = (transfers || []).map(transfer => ({
    transfer_date: formatDate(transfer.transfer_date),
    product_name: transfer.product?.name || transfer.product_name || '',
    batch_id: transfer.batch_id || '',
    quantity: transfer.quantity || 0,
    transferred_by: transfer.transferred_by || '',
    from_location: transfer.from_location || 'production',
    to_location: transfer.to_location || 'shop',
    notes: transfer.notes || '',
  }));

  const csv = dataToCSV(columns, data);
  downloadFile(csv, filename);
}

/**
 * Export Route Riders Directory
 */
export function exportRouteRiders(
  riders: any[],
  filename: string = 'route_riders_export.csv'
): void {
  const columns: ExcelColumn[] = [
    { header: 'Full Name', key: 'full_name', width: 20 },
    { header: 'Nickname', key: 'nickname', width: 15 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Created At', key: 'created_at', width: 15 },
  ];

  const data = (riders || []).map(rider => ({
    full_name: rider.full_name || rider.name || '',
    nickname: rider.nickname || '',
    phone: rider.phone || '',
    status: rider.status || 'active',
    created_at: formatDate(rider.created_at),
  }));

  const csv = dataToCSV(columns, data);
  downloadFile(csv, filename);
}

/**
 * Export Products Inventory
 */
export function exportProducts(
  products: any[],
  filename: string = 'products_export.csv'
): void {
  const columns: ExcelColumn[] = [
    { header: 'Product Name', key: 'name', width: 20 },
    { header: 'Product Code', key: 'product_code', width: 15 },
    { header: 'Unit Cost', key: 'unit_cost', width: 12 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Created At', key: 'created_at', width: 15 },
  ];

  const data = (products || []).map(product => ({
    name: product.name || '',
    product_code: product.product_code || '',
    unit_cost: formatCurrency(product.unit_cost),
    category: product.category || '',
    status: product.status || 'active',
    created_at: formatDate(product.created_at),
  }));

  const csv = dataToCSV(columns, data);
  downloadFile(csv, filename);
}

/**
 * Export Production Reports (Summary)
 */
export function exportProductionReport(
  reportData: any[],
  filename: string = 'production_report_export.csv'
): void {
  const columns: ExcelColumn[] = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Batches Created', key: 'batches_created', width: 15 },
    { header: 'Total Produced', key: 'total_produced', width: 15 },
    { header: 'Total Dispatched', key: 'total_dispatched', width: 15 },
    { header: 'Shop Transfers', key: 'shop_transfers', width: 15 },
    { header: 'Returns', key: 'returns', width: 12 },
  ];

  const data = (reportData || []).map(row => ({
    date: formatDate(row.date),
    batches_created: row.batches_created || 0,
    total_produced: row.total_produced || 0,
    total_dispatched: row.total_dispatched || 0,
    shop_transfers: row.shop_transfers || 0,
    returns: row.returns || 0,
  }));

  const csv = dataToCSV(columns, data);
  downloadFile(csv, filename);
}

/**
 * Advanced: Export multiple sheets to Excel (requires xlsx library)
 * For now, returns promise that resolves when done
 * 
 * Example usage with xlsx:
 * import XLSX from 'xlsx';
 * 
 * const wb = XLSX.utils.book_new();
 * const ws1 = XLSX.utils.json_to_sheet(batches);
 * XLSX.utils.book_append_sheet(wb, ws1, "Batches");
 * XLSX.writeFile(wb, "export.xlsx");
 */
export async function exportMultipleSheets(
  sheetsData: ExportData[],
  filename: string = 'production_report.xlsx'
): Promise<void> {
  // This is a placeholder for xlsx integration
  // In production, use: npm install xlsx
  
  for (const sheet of sheetsData) {
    const csv = dataToCSV(sheet.columns, sheet.data);
    console.log(`Sheet: ${sheet.sheetName}`);
    console.log(csv);
  }
  
  console.warn(`To export multiple sheets, install 'xlsx' package and update this function`);
}
