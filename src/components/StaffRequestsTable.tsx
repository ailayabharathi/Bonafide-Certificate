import { useState } from "react";
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
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface StaffRequestsTableProps {
  requests: BonafideRequestWithProfile[];
  title: string;
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

export function StaffRequestsTable({ requests, title, onAction }: StaffRequestsTableProps) {
  const { profile } = useAuth();
  const [actionRequest, setActionRequest] = useState<BonafideRequestWithProfile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Admin rejection can be handled here if needed in future
      else return;
    }

    await onAction(actionRequest.id, newStatus, rejectionReason);
    setIsSubmitting(false);
    closeDialog();
  };

  const getActionability = (status: BonafideStatus) => {
    if (profile?.role === 'tutor') {
      return status === 'pending';
    }
    if (profile?.role === 'hod') {
      return status === 'approved_by_tutor';
    }
    if (profile?.role === 'admin') {
        return status === 'approved_by_hod';
    }
    return false;
  };
  
  const getApproveButtonText = () => {
      if (profile?.role === 'admin') return 'Mark as Completed';
      return 'Approve';
  }

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-md">
        <p className="text-muted-foreground">No {title.toLowerCase()} requests found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <h2 className="text-2xl font-semibold tracking-tight p-4">{title}</h2>
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
          {requests.map((request) => (
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