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

interface StudentRequestsTableProps { // Renamed interface
  requests: BonafideRequest[];
  onEdit: (request: BonafideRequest) => void;
  onCancel: (requestId: string) => Promise<void>;
}

type SortableKey = keyof BonafideRequest;

const getStatusVariant = (status: BonafideRequest['status']) => {
  switch (status) {
    case 'pending': return 'default';
    case 'approved_by_tutor':
    case 'approved_by_hod': return 'outline';
    case 'completed': return 'default';
    case 'rejected_by_tutor':
    case 'rejected_by_hod': return 'destructive';
    default: return 'secondary';
  }
};

const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function StudentRequestsTable({ requests, onEdit, onCancel }: StudentRequestsTableProps) { // Renamed component
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'descending' | 'ascending' }>({ key: 'created_at', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [requestToCancel, setRequestToCancel] = useState<BonafideRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const handleSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
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
    setStatusFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const processedRequests = useMemo(() => {
    let filteredRequests = [...requests];

    if (statusFilter !== "all") {
      filteredRequests = filteredRequests.filter(r => {
        if (statusFilter === 'in_progress') {
          return ['pending', 'approved_by_tutor', 'approved_by_hod'].includes(r.status);
        }
        if (statusFilter === 'completed') {
          return r.status === 'completed';
        }
        if (statusFilter === 'rejected') {
          return ['rejected_by_tutor', 'rejected_by_hod'].includes(r.status);
        }
        return r.status === statusFilter;
      });
    }

    if (searchQuery) {
      filteredRequests = filteredRequests.filter(r =>
        r.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filteredRequests.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return filteredRequests;
  }, [requests, sortConfig, statusFilter, searchQuery]);

  const totalPages = Math.ceil(processedRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = processedRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isRejected = (status: BonafideRequest['status']) => 
    status === 'rejected_by_tutor' || status === 'rejected_by_hod';

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
  ], [onEdit, onCancel]);


  return (
    <>
      <div className="border rounded-md">
        <StudentRequestsToolbar
          statusFilter={statusFilter}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
          searchQuery={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
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