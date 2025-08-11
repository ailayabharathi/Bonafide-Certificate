import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { BonafideRequest, SortConfig } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useStudentDashboardData } from "@/hooks/useStudentDashboardData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetch all requests for the dashboard stats, unfiltered.
const fetchAllStudentRequests = async (userId: string) => {
    const { data, error } = await supabase
        .from('bonafide_requests')
        .select('*')
        .eq('user_id', userId);
    if (error) {
        showError("Could not load dashboard data.");
        return [];
    }
    return data;
};

export const useStudentPortalLogic = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State for UI controls
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<BonafideRequest | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<BonafideRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // State for data filtering and sorting, to be passed to useBonafideRequests
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });

  // Fetch all requests for dashboard stats (unfiltered)
  const { data: allRequestsForStats = [] } = useQuery<BonafideRequest[]>({
    queryKey: ['allStudentRequests', user?.id],
    queryFn: () => fetchAllStudentRequests(user!.id),
    enabled: !!user,
  });

  // Dashboard data calculation
  const dashboardData = useStudentDashboardData(allRequestsForStats);

  // Realtime event handler
  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<BonafideRequest>) => {
    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: ['bonafide_requests'] });
    queryClient.invalidateQueries({ queryKey: ['allStudentRequests'] });
    
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

  // Handlers for UI actions
  const handleNewRequestClick = () => {
    setRequestToEdit(null);
    setIsApplyDialogOpen(true);
  };

  const handleEditRequest = (request: BonafideRequest) => {
    setRequestToEdit(request);
    setIsApplyDialogOpen(true);
  };

  const handleConfirmCancel = async (deleteRequestFn: (id: string) => Promise<void>) => {
    if (!requestToCancel) return;
    setIsCancelling(true);
    try {
      await deleteRequestFn(requestToCancel.id);
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
  };

  return {
    user,
    isApplyDialogOpen,
    setIsApplyDialogOpen,
    requestToEdit,
    requestToCancel,
    setRequestToCancel,
    isCancelling,
    dashboardData,
    handleNewRequestClick,
    handleEditRequest,
    handleRealtimeEvent,
    handleConfirmCancel,
    handleClearFilters,
    // Filter and sort state
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
  };
};