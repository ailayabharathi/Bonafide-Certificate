import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApplyCertificateForm } from "@/components/ApplyCertificateForm";
import { RequestsTable } from "@/components/RequestsTable";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BonafideRequest } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { StatsCard } from "@/components/StatsCard";

const StudentPortal = () => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<BonafideRequest | null>(null);

  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<BonafideRequest>) => {
    if (payload.eventType !== 'UPDATE' || !user || payload.new.user_id !== user.id) return;

    const oldStatus = (payload.old as BonafideRequest)?.status;
    const newStatus = payload.new.status;
    const rejectionReason = payload.new.rejection_reason;

    if (oldStatus !== newStatus) {
        switch(newStatus) {
            case 'approved_by_tutor':
                showSuccess("Approved by Tutor! Your request is now with the HOD.");
                break;
            case 'rejected_by_tutor':
                showError(`Request Rejected by Tutor. Reason: ${rejectionReason || 'No reason provided.'}`);
                break;
            case 'approved_by_hod':
                showSuccess("Approved by HOD! Your request is being processed by the office.");
                break;
            case 'rejected_by_hod':
                showError(`Request Rejected by HOD. Reason: ${rejectionReason || 'No reason provided.'}`);
                break;
            case 'completed':
                showSuccess("Certificate Ready! Your bonafide certificate is now available.");
                break;
        }
    }
  };

  const { requests, isLoading } = useBonafideRequests(
    `student-requests:${user?.id}`,
    user?.id,
    handleRealtimeEvent,
  );

  const handleNewRequestClick = () => {
    setRequestToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditRequest = (request: BonafideRequest) => {
    setRequestToEdit(request);
    setIsDialogOpen(true);
  };

  const headerActions = (
    <Button onClick={handleNewRequestClick}>
      <PlusCircle className="mr-2 h-4 w-4" />
      Apply for Certificate
    </Button>
  );

  const stats = {
    total: requests.length,
    inProgress: requests.filter(r => ['pending', 'approved_by_tutor', 'approved_by_hod'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => ['rejected_by_tutor', 'rejected_by_hod'].includes(r.status)).length,
  };

  return (
    <DashboardLayout title="Student Dashboard" headerActions={headerActions}>
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Requests" value={stats.total} icon={ClipboardList} />
            <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} />
            <StatsCard title="Completed" value={stats.completed} icon={CheckCircle} />
            <StatsCard title="Rejected" value={stats.rejected} icon={XCircle} />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Your Requests History</h2>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <RequestsTable requests={requests} onEdit={handleEditRequest} />
          )}
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{requestToEdit ? 'Edit and Resubmit Request' : 'New Bonafide Certificate Request'}</DialogTitle>
            <DialogDescription>
              {requestToEdit ? 'Update the reason below and resubmit your request for approval.' : 'Fill out the form below to submit your request.'}
            </DialogDescription>
          </DialogHeader>
          <ApplyCertificateForm 
            onSuccess={() => setIsDialogOpen(false)} 
            setOpen={setIsDialogOpen}
            existingRequest={requestToEdit}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentPortal;