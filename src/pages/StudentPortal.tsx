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
import { PlusCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { StatsCard } from "@/components/StatsCard";
import { StatusDistributionChart } from "@/components/StatusDistributionChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStudentDashboardData } from "@/hooks/useStudentDashboardData";

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

  const { requests, isLoading, deleteRequest } = useBonafideRequests(
    `student-requests:${user?.id}`,
    user?.id,
    handleRealtimeEvent,
  );

  const { stats, chartData } = useStudentDashboardData(requests);

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

  return (
    <DashboardLayout title="Student Dashboard" headerActions={headerActions}>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader>
                <CardTitle>Requests History</CardTitle>
                <CardDescription>A log of all your bonafide certificate requests.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <RequestsTable requests={requests} onEdit={handleEditRequest} onCancel={deleteRequest} />
              </CardContent>
            </Card>
            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
                <CardDescription>A breakdown of your request statuses.</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusDistributionChart data={chartData} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
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