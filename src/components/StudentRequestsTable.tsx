import { useState, useMemo } from "react";
import { BonafideRequest, SortConfig } from "@/types";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { StudentRequestsToolbar } from "./StudentRequestsToolbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "./DataTable";
import { getStudentTableColumns } from "@/lib/student-table-columns";

const ITEMS_PER_PAGE = 10;

interface StudentRequestsTableProps {
  requests: BonafideRequest[];
  onEdit: (request: BonafideRequest) => void;
  onCancel: (requestId: string) => Promise<void>;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
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
}: StudentRequestsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [requestToCancel, setRequestToCancel] = useState<BonafideRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    onSortChange({ key, direction });
    setCurrentPage(1);
  };

  const handleConfirmCancel = async () => {
    if (!requestToCancel) return;
    setIsCancelling(true);
    try {
      await onCancel(requestToCancel.id);
    } catch (error) {
      console.error("Failed to cancel request:", error);
    } finally {
      setIsCancelling(false);
      setRequestToCancel(null);
    }
  };

  const handleClearFilters = () => {
    onStatusChange("all");
    onSearchChange("");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns = useMemo(() => getStudentTableColumns({
    onEdit,
    onCancel: (id) => setRequestToCancel(requests.find(r => r.id === id) || null),
  }), [onEdit, requests]);

  return (
    <>
      <div className="border rounded-md">
        <StudentRequestsToolbar
          statusFilter={statusFilter}
          onStatusChange={onStatusChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onClearFilters={handleClearFilters}
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
      <AlertDialog open={!!requestToCancel} onOpenChange={(open) => !open && setRequestToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel your request. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} disabled={isCancelling} className="bg-destructive hover:bg-destructive/90">
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}