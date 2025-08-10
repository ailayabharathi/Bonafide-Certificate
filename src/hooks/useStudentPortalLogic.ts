import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BonafideRequest } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useStudentDashboardData } from "@/hooks/useStudentDashboardData";

export const useStudentPortalLogic = () => {
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

  return {
    user,
    isDialogOpen,
    setIsDialogOpen,
    requestToEdit,
    requests,
    isLoading,
    deleteRequest,
    stats,
    chartData,
    handleNewRequestClick,
    handleEditRequest,
  };
};