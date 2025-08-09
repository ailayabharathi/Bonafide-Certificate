import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) {
    // This case should be handled by the caller, but as a fallback:
    console.warn("No data provided for CSV export.");
    return;
  }

  const separator = ",";
  const keys = Object.keys(rows[0]);
  
  const csvHeader = keys.join(separator);

  const csvRows = rows.map(row => {
    return keys.map(k => {
      let cell = row[k] === null || row[k] === undefined ? "" : row[k];
      
      cell = String(cell);

      let escapedCell = cell.replace(/"/g, '""');
      
      if (escapedCell.search(/("|,|\n)/g) >= 0) {
        escapedCell = `"${escapedCell}"`;
      }
      return escapedCell;
    }).join(separator);
  });

  const csvContent = `${csvHeader}\n${csvRows.join("\n")}`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL
  }
}