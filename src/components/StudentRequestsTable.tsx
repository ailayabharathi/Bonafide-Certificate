import { useState, useMemo } from "react";
import { BonafideRequest, SortConfig } from "@/types";
import { StudentRequestsToolbar } from "./StudentRequestsToolbar";
import { DataTable } from "./DataTable";
import { getStudentTableColumns } from "@/lib/student-table-columns";

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    onSortChange({ key, direction });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        data={paginatedRequests}
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