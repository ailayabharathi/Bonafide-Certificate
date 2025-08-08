import { useState, useMemo, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StaffRequestsTableProps {
  requests: BonafideRequestWithProfile[];
  onAction: (requestId: string, newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
}

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

export function StaffRequestsTable({ requests, onAction }: StaffRequestsTableProps) {
  const { profile } = useAuth();
  const [actionRequest, setActionRequest] = useState<BonafideRequestWithProfile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("actionable");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const openDialog = (request: BonafideRequestWithProfile, type: 'approve' | 'reject') => {
    setActionRequest(request);
    setActionType(type);
    setRejectionReason("");
  };

  const closeDialog = () => {
    setActionRequest(null);
    setActionType(null);
    setRejectionReason("");
  };

  const handleConfirm = async () => {
    if (!actionRequest || !actionType || !profile) return;

    setIsSubmitting(true);
    let newStatus: BonafideStatus;

    if (actionType === 'approve') {
      if (profile.role === 'tutor') newStatus = 'approved_by_tutor';
      else if (profile.role === 'hod') newStatus = 'approved_by_hod';
      else if (profile.role === 'admin') newStatus = 'completed';
      else return;
    } else { // reject
      if (rejectionReason.trim().length < 10) {
        alert("Rejection reason must be at least 10 characters.");
        setIsSubmitting(false);
        return;
      }
      if (profile.role === 'tutor') newStatus = 'rejected_by_tutor';
      else if (profile.role === 'hod') newStatus = 'rejected_by_hod';
      else return;
    }

    await onAction(actionRequest.id, newStatus, rejectionReason);
    setIsSubmitting(false);
    closeDialog();
  };

  const getActionability = (status: BonafideStatus) => {
    if (profile?.role === 'tutor') return status === 'pending';
    if (profile?.role === 'hod') return status === 'approved_by_tutor';
    if (profile?.role === 'admin') return status === 'approved_by_hod';
    return false;
  };
  
  const getApproveButtonText = () => {
      if (profile?.role === 'admin') return 'Mark as Completed';
      return 'Approve';
  }

  const categorizedRequests = useMemo(() => {
    const source = requests.filter(request => {
      const studentName = `${request.profiles?.first_name || ''} ${request.profiles?.last_name || ''}`.toLowerCase();
      return studentName.includes(searchQuery.toLowerCase());
    });

    if (!profile) return { actionable: [], inProgress: [], completed: [], rejected: [], all: [] };

    const actionable = (() => {
      if (profile.role === 'tutor') return source.filter(r => r.status === 'pending');
      if (profile.role === 'hod') return source.filter(r => r.status === 'approved_by_tutor');
      if (profile.role === 'admin') return source.filter(r => r.status === 'approved_by_hod');
      return [];
    })();

    return {
      actionable,
      inProgress: source.filter(r => ['pending', 'approved_by_tutor', 'approved_by_hod'].includes(r.status)),
      completed: source.filter(r => r.status === 'completed'),
      rejected: source.filter(r => ['rejected_by_tutor', 'rejected_by_hod'].includes(r.status)),
      all: source,
    };
  }, [requests, searchQuery, profile]);

  const renderTable = (requestsToRender: BonafideRequestWithProfile[]) => {
    const totalItems = requestsToRender.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginatedRequests = requestsToRender.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

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
              <TableHead>Student Name</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.profiles?.first_name} {request.profiles?.last_name}</TableCell>
                <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(request.status)} className={cn(request.status === 'completed' && 'bg-green-500 text-white')}>
                    {formatStatus(request.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getActionability(request.status) ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openDialog(request, 'approve')}>{getApproveButtonText()}</Button>
                      {profile?.role !== 'admin' && <Button size="sm" variant="destructive" onClick={() => openDialog(request, 'reject')}>Reject</Button>}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No action needed</span>
                  )}
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
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
      </>
    );
  };

  const tabs = [
    { value: 'actionable', label: 'Action Required', data: categorizedRequests.actionable },
    { value: 'inProgress', label: 'In Progress', data: categorizedRequests.inProgress },
    { value: 'completed', label: 'Completed', data: categorizedRequests.completed },
    { value: 'rejected', label: 'Rejected', data: categorizedRequests.rejected },
    { value: 'all', label: 'All', data: categorizedRequests.all },
  ];

  return (
    <div className="border rounded-md bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between p-4 border-b flex-wrap gap-4">
          <TabsList>
            {tabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label} ({tab.data.length})
              </TabsTrigger>
            ))}
          </TabsList>
          <Input
            placeholder="Search by student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="m-0">
            {renderTable(tab.data)}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!actionRequest} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action: {actionType === 'approve' ? getApproveButtonText() : 'Reject'} Request</DialogTitle>
            <DialogDescription>
              You are about to {actionType} a request from {actionRequest?.profiles?.first_name} {actionRequest?.profiles?.last_name}.
            </DialogDescription>
          </DialogHeader>
          {actionType === 'reject' && (
            <div className="grid gap-4 py-4">
              <Label htmlFor="rejectionReason">Reason for Rejection</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a clear reason for rejection (min. 10 characters)."
              />
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}