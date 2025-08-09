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
    getStatusVariant, // Now imported from hook
    formatStatus,     // Now imported from hook
    isRejected,       // Now imported from hook
  } = useStudentRequestsTableLogic(requests, onCancel);

  const showClearFilters = statusFilter !== "all" || searchQuery !== "";

  const columns = useMemo(() => [
    {
      id: 'created_at',
      header: 'Date Submitted',
      cell: ({ row }: { row: BonafideRequest }) => new Date(row.created_at).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'reason',
      header: 'Reason',
      cell: ({ row }: { row: BonafideRequest }) => <div className="max-w-xs truncate">{row.reason}</div>,
      enableSorting: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: BonafideRequest }) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={getStatusVariant(row.status)} className={cn(row.status === 'completed' && 'bg-green-500 text-white')}>
            {formatStatus(row.status)}
          </Badge>
          {row.rejection_reason && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-destructive max-w-[200px] truncate cursor-help">
                    Reason: {row.rejection_reason}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.rejection_reason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: BonafideRequest }) => (
        <div className="flex gap-1 justify-end">
          {row.status === 'completed' && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/certificate/${row.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </Button>
          )}
          {isRejected(row.status) && (
            <Button variant="secondary" size="sm" onClick={() => onEdit(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit & Resubmit
            </Button>
          )}
          {row.status === 'pending' && (
            <Button variant="destructive" size="sm" onClick={() => setRequestToCancel(row)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ], [onEdit, setRequestToCancel, getStatusVariant, formatStatus, isRejected]);


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