import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnDef, SortConfig } from "@/types"; // Import from types

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  enableRowSelection?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  actionableIdsOnPage?: string[]; // For staff table, to know which rows can be selected
  rowKey: (row: TData) => string; // Function to get a unique key for each row
}

export function DataTable<TData>({
  columns,
  data,
  sortConfig,
  onSort,
  currentPage,
  onPageChange,
  totalPages,
  enableRowSelection = false,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  actionableIdsOnPage = [],
  rowKey,
}: DataTableProps<TData>) {

  const numSelectedOnPage = selectedIds.filter(id => actionableIdsOnPage.includes(id)).length;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {enableRowSelection && (
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    actionableIdsOnPage.length > 0 && numSelectedOnPage === actionableIdsOnPage.length
                      ? true
                      : numSelectedOnPage > 0 && numSelectedOnPage < actionableIdsOnPage.length
                      ? "indeterminate"
                      : false
                  }
                  onCheckedChange={(checked) => onSelectAll?.(!!checked)}
                  aria-label="Select all on page"
                  disabled={actionableIdsOnPage.length === 0}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead key={column.id} className={column.className}>
                {column.enableSorting ? (
                  <Button variant="ghost" onClick={() => onSort(column.id)}>
                    {column.header as string}
                    {sortConfig.key === column.id ? (
                      sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />
                    )}
                  </Button>
                ) : (
                  typeof column.header === 'function' ? column.header({ sortConfig, onSort }) : column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow key={rowKey(row)} data-state={enableRowSelection && selectedIds.includes(rowKey(row)) ? "selected" : undefined}>
                {enableRowSelection && (
                  <TableCell className="w-12">
                    <Checkbox
                      checked={selectedIds.includes(rowKey(row))}
                      onCheckedChange={(checked) => onToggleSelect?.(rowKey(row), !!checked)}
                      aria-label={`Select row ${rowKey(row)}`}
                      disabled={!actionableIdsOnPage.includes(rowKey(row))} // Disable if not actionable
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={`${rowKey(row)}-${column.id}`} className={column.className}>
                    {column.cell({ row })}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (enableRowSelection ? 1 : 0)} className="h-24 text-center">
                No data to display.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
          <div className="flex-1 text-sm text-muted-foreground">
              Page {currentPage} of {totalPages || 1}
          </div>
          <div className="space-x-2">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
              >
                  Previous
              </Button>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
              >
                  Next
              </Button>
          </div>
      </div>
    </>
  );
}