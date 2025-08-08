import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Eye, Edit, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequestsTableProps {
  requests: BonafideRequest[];
  onEdit: (request: BonafideRequest) => void;
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

export function RequestsTable({ requests, onEdit }: RequestsTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'descending' | 'ascending' }>({ key: 'created_at', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const ITEMS_PER_PAGE = 10;

  const handleSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const processedRequests = useMemo(() => {
    let filteredRequests = [...requests];

    if (statusFilter !== "all") {
      filteredRequests = filteredRequests.filter(r => {
        if (statusFilter === 'in_progress') {
          return ['pending', 'approved_by_tutor', 'approved_by_hod'].includes(r.status);
        }
        if (statusFilter === 'rejected') {
          return ['rejected_by_tutor', 'rejected_by_hod'].includes(r.status);
        }
        return r.status === statusFilter;
      });
    }

    filteredRequests.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return filteredRequests;
  }, [requests, sortConfig, statusFilter]);

  const totalPages = Math.ceil(processedRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = processedRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const SortableHeader = ({ columnKey, title }: { columnKey: SortableKey, title: string }) => {
    const isSorted = sortConfig.key === columnKey;
    return (
      <TableHead>
        <Button variant="ghost" onClick={() => handleSort(columnKey)}>
          {title}
          {isSorted ? (
            sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />
          )}
        </Button>
      </TableHead>
    );
  };

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-md">
        <p className="text-muted-foreground">You haven't made any requests yet.</p>
      </div>
    );
  }

  const isRejected = (status: BonafideRequest['status']) => 
    status === 'rejected_by_tutor' || status === 'rejected_by_hod';

  return (
    <div className="border rounded-md">
      <div className="p-4 border-b">
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader columnKey="created_at" title="Date Submitted" />
            <SortableHeader columnKey="reason" title="Reason" />
            <SortableHeader columnKey="status" title="Status" />
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRequests.length > 0 ? (
            paginatedRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant={getStatusVariant(request.status)} className={cn(request.status === 'completed' && 'bg-green-500 text-white')}>
                          {formatStatus(request.status)}
                        </Badge>
                      </TooltipTrigger>
                      {request.rejection_reason && (
                        <TooltipContent>
                          <p>Reason: {request.rejection_reason}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-right">
                  {request.status === 'completed' && (
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/certificate/${request.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  )}
                  {isRejected(request.status) && (
                     <Button variant="secondary" size="sm" onClick={() => onEdit(request)}>
                       <Edit className="mr-2 h-4 w-4" />
                       Edit & Resubmit
                     </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No requests match the current filter.
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
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}