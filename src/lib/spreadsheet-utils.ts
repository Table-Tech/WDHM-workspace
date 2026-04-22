// Spreadsheet utility functions

/**
 * Format a number as Euro currency
 * Shows € - for zero values
 */
export function formatEuro(value: number): string {
  if (value === 0) return '€ -';
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parse Euro string back to number
 */
export function parseEuro(value: string): number {
  const cleaned = value.replace(/[€\s.,]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Sum an array of numbers
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * Calculate total for a row
 */
export function rowTotal(values: number[]): number {
  return sum(values);
}

/**
 * Calculate monthly column totals from multiple rows
 */
export function columnTotals(rows: number[][]): number[] {
  if (rows.length === 0) return Array(12).fill(0);
  return rows[0].map((_, colIndex) =>
    rows.reduce((sum, row) => sum + (row[colIndex] || 0), 0)
  );
}

/**
 * Dutch month labels
 */
export const MAANDEN = [
  'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec'
] as const;

/**
 * Get full month labels for a year
 */
export function getMaandLabels(jaar: number): string[] {
  const jaarStr = jaar.toString().slice(-2);
  return MAANDEN.map(m => `${m}-${jaarStr}`);
}
