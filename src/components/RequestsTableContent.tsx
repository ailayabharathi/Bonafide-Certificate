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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Profile } from "@/contexts/AuthContext";
import { ArrowUpDown, ArrowUp, ArrowDown, User, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

interface RequestsTableContentProps {
  requestsToRender: BonafideRequestWithProfile[];
  profile: Profile | null;
  onViewProfile: (userId: string) => void;
  onOpenActionDialog: (type: 'approve' | 'reject' | 'revert', bulk: boolean, request?: BonafideRequestWithProfile) => void;
  getApproveButtonText: () => string;
  selectedIds: string[];
  onToggleSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  sortConfig: { key: string; direction: 'descending' | 'ascending' };
  onSort: (key: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

type SortableKey = keyof BonafideRequestWithProfile | 'studentName';

const getStatusVariant = (status: BonafideStatus) => {
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
};

const ITEMS_PER_PAGE = 10; // Define here as it's used for pagination logic

export function RequestsTableContent({
  requestsToRender,
  profile,
  onViewProfile,
  onOpenActionDialog,
  getApproveButtonText,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  sortConfig,
  onSort,
  currentPage,
  onPageChange,
  totalPages,
}: RequestsTableContentProps) {

  const getActionability = (status: BonafideStatus) => {
    if (profile?.role === 'tutor') return status === 'pending';
    if (profile?.role === 'hod') return status === 'approved_by_tutor';
    if (profile?.role === 'admin') return status === 'approved_by_hod';
    return false;
  };

  const actionableIdsOnPage = useMemo(() => 
    requestsToRender.filter(r => getActionability(r.status)).map(r => r.id),
    [requestsToRender, profile]
  );
  const numSelectedOnPage = selectedIds.filter(id => actionableIdsOnPage.includes(id)).length;

  const SortableHeader = ({ columnKey, title }: { columnKey: SortableKey, title: string }) => {
    const isSorted = sortConfig.key === columnKey;
    return (
      <TableHead>
        <Button variant="ghost" onClick={() => onSort(columnKey)}>
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

  if (requestsToRender.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 p-4">
        <p className="text-muted-foreground">No requests in this category.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  actionableIdsOnPage.length > 0 && numSelectedOnPage === actionableIdsOnPage.length
                    ? true
                    : numSelectedOnPage > 0 && numSelectedOnPage < actionableIdsOnPage.length
                    ? "indeterminate"
                    : false
                }
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                aria-label="Select all on page"
                disabled={actionableIdsOnPage.length === 0}
              />
            </TableHead>
            <SortableHeader columnKey="studentName" title="Student Name" />
            <TableHead>Register No.</TableHead>
            <TableHead>Department</TableHead>
            <SortableHeader columnKey="created_at" title="Submitted" />
            <TableHead>Reason</TableHead>
            <SortableHeader columnKey="status" title="Status" />
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requestsToRender.map((request) => (
            <TableRow key={request.id} data-state={selectedIds.includes(request.id) ? "selected" : undefined}>
              <TableCell className="w-12">
                <Checkbox
                  checked={selectedIds.includes(request.id)}
                  onCheckedChange={(checked) => onToggleSelect(request.id, !!checked)}
                  aria-label={`Select request ${request.id}`}
                  disabled={!getActionability(request.status)}
                />
              </TableCell>
              <TableCell>{request.profiles?.first_name} {request.profiles?.last_name}</TableCell>
              <TableCell>{request.profiles?.register_number}</TableCell>
              <TableCell>{request.profiles?.department}</TableCell>
              <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-1">
                  <Badge variant={getStatusVariant(request.status)} className={cn(request.status === 'completed' && 'bg-green-500 text-white')}>
                    {formatStatus(request.status)}
                  </Badge>
                  {request.rejection_reason && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-destructive max-w-[200px] truncate cursor-help">
                            Reason: {request.rejection_reason}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{request.rejection_reason}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {request.profiles && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => onViewProfile(request.user_id)}>
                            <User className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Student Profile</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {request.status === 'completed' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/certificate/${request.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Certificate</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {getActionability(request.status) ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => onOpenActionDialog('approve', false, request)}>{getApproveButtonText()}</Button>
                      {profile?.role !== 'admin' && <Button size="sm" variant="destructive" onClick={() => onOpenActionDialog('reject', false, request)}>Reject</Button>}
                    </>
                  ) : profile?.role === 'admin' && request.status === 'completed' ? (
                    <Button size="sm" variant="secondary" onClick={() => onOpenActionDialog('revert', false, request)}>Revert</Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No action needed</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
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