import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BonafideRequestWithProfile } from "@/types";
import { Loader2 } from "lucide-react";

interface RequestActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'approve' | 'reject' | 'revert' | null;
  isBulk: boolean;
  request: BonafideRequestWithProfile | null;
  selectedIdsCount: number;
  onConfirm: (rejectionReason?: string) => void;
  isSubmitting: boolean;
  getApproveButtonText: () => string;
}

export function RequestActionDialog({
  isOpen,
  onOpenChange,
  actionType,
  isBulk,
  request,
  selectedIdsCount,
  onConfirm,
  isSubmitting,
  getApproveButtonText,
}: RequestActionDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setRejectionReason("");
    }
  }, [isOpen]);

  const handleConfirmClick = () => {
    if (actionType === 'reject' && rejectionReason.trim().length < 10) {
      alert("Rejection reason must be at least 10 characters.");
      return;
    }
    onConfirm(rejectionReason);
  };

  const getDialogTitle = () => {
    if (!actionType) return "";
    let title = "";
    if (actionType === 'approve') title = getApproveButtonText();
    else if (actionType === 'reject') title = 'Reject';
    else if (actionType === 'revert') title = 'Revert';
    return `Confirm Action: ${title} Request${isBulk ? 's' : ''}`;
  };

  const getDialogDescription = () => {
    if (!actionType) return "";
    const requestName = `${request?.profiles?.first_name} ${request?.profiles?.last_name}`;
    const target = isBulk ? `${selectedIdsCount} requests` : `a request from ${requestName}`;

    if (actionType === 'revert') {
      return `This will revert the status of ${target} from 'Completed' back to 'Approved by HOD'. The student will no longer be able to view the certificate. Are you sure?`;
    }
    return `You are about to ${actionType} ${target}.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
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
            <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirmClick} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}