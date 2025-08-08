import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApplyCertificateForm } from "@/components/ApplyCertificateForm";
import { RequestsTable } from "@/components/RequestsTable";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BonafideRequest } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";

const StudentPortal = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BonafideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    if (requests.length === 0) {
        setLoading(true);
    }
    try {
      const { data, error } = await supabase
        .from("bonafide_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }, [user, requests.length]);

  useEffect(() => {
    if (user) {
      fetchRequests();

      const channel = supabase
        .channel(`student-requests:${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'bonafide_requests',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              const oldStatus = payload.old.status;
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
            }
            fetchRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchRequests]);

  const headerActions = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Apply for Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Bonafide Certificate Request</DialogTitle>
          <DialogDescription>
            Fill out the form below to submit your request.
          </DialogDescription>
        </DialogHeader>
        <ApplyCertificateForm onSuccess={() => setIsDialogOpen(false)} setOpen={setIsDialogOpen} />
      </DialogContent>
    </Dialog>
  );

  return (
    <DashboardLayout title="Student Dashboard" headerActions={headerActions}>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Your Requests</h2>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <RequestsTable requests={requests} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentPortal;