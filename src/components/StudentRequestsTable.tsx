import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { BonafideRequest } from "@/types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Eye, Edit, Trash2, Loader2 } from "lucide-react";
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
import { DataTable } from "./DataTable"; // Import DataTable
import { useStudentRequestsTableLogic } from "@/hooks/useStudentRequestsTableLogic"; // Import the new hook
import { getStudentTableColumns } from "@/lib/student-table-columns"; // Import the new utility

interface StudentRequestsTableProps { // Renamed interface
  requests: BonafideRequest[];
  onEdit: (request: BonafideRequest) => void;
  onCancel: (requestId: string) => Promise<void>;
}

export function StudentRequestsTable({ requests, onEdit, onCancel }: StudentRequestsTableProps) { // Renamed component
  const {
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    requestToCancel,
    setRequestToCancel,
    isCancelling,
    handleConfirmCancel,
    handleClearFilters,
    processedRequests,
    totalPages,
    paginatedRequests,
  } = useStudentRequestsTableLogic(requests, onCancel);

  const showClearFilters = statusFilter !== "all" || searchQuery !== "";

  const columns = useMemo(() => getStudentTableColumns({
    onEdit,
    onCancel: (id) => setRequestToCancel(requests.find(r => r.id === id) || null), // Pass a function that sets requestToCancel
  }), [onEdit, requests, setRequestToCancel]);


  return (
    <>
      <div className="border rounded-md">
        <StudentRequestsToolbar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearFilters={handleClearFilters}
        />
        <DataTable
          columns={columns}
          data={paginatedRequests}
          sortConfig={sortConfig as { key: string; direction: 'ascending' | 'descending' }}
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