import { useState, useMemo } from "react";
import { BonafideRequest, SortConfig } from "@/types";
import { StudentRequestsToolbar } from "./StudentRequestsToolbar";
import { DataTable } from "./DataTable";
import { getStudentTableColumns } from "@/lib/student-table-columns";
import { useDataTable } from "@/hooks/useDataTable";

interface StudentRequestsTableProps {
  requests: BonafideRequest[];
  onEdit: (request: BonafideRequest) => void;
  onCancel: (request: BonafideRequest) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  onClearFilters: () => void;
}

export function StudentRequestsTable({
  requests,
  onEdit,
  onCancel,
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  sortConfig,
  onSortChange,
  onClearFilters,
}: StudentRequestsTableProps) {
  const {
    paginatedRows,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useDataTable({
    data: requests,
    rowKey: (row) => row.id,
  });

  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    onSortChange({ key, direction });
  };

  const columns = useMemo(() => getStudentTableColumns({
    onEdit,
    onCancel: (id) => {
      const requestToCancel = requests.find(r => r.id === id);
      if (requestToCancel) {
        onCancel(requestToCancel);
      }
    },
  }), [onEdit, onCancel, requests]);

  return (
    <div className="border rounded-md">
      <StudentRequestsToolbar
        statusFilter={statusFilter}
        onStatusChange={onStatusChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onClearFilters={onClearFilters}
      />
      <DataTable
        columns={columns}
        data={paginatedRows}
        sortConfig={sortConfig}
        onSort={handleSort}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
        rowKey={(row) => row.id}
      />
    </div>
  );
}