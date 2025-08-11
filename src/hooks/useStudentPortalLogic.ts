import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { BonafideRequest, SortConfig } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useStudentDashboardData } from "@/hooks/useStudentDashboardData";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";

export const useStudentPortalLogic = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State for UI controls
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<BonafideRequest | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<BonafideRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // State for data filtering and sorting
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });

  // Realtime event handler
  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<BonafideRequest>) => {
    queryClient.invalidateQueries({ queryKey: ['bonafide_requests'] });
    
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

  // Fetch ALL requests for the student once.
  const { requests: allRequests, isLoading, deleteRequest: deleteRequestFn } = useBonafideRequests(
    `student-requests:${user?.id}`,
    { userId: user?.id },
    handleRealtimeEvent
  );

  // Memoize filtered and sorted requests for the table
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = [...allRequests];

    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'in_progress') {
        filtered = filtered.filter(r => ['pending', 'approved_by_tutor', 'approved_by_hod'].includes(r.status));
      } else if (statusFilter === 'rejected') {
        filtered = filtered.filter(r => ['rejected_by_tutor', 'rejected_by_hod'].includes(r.status));
      } else {
        filtered = filtered.filter(r => r.status === statusFilter);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(r => r.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof BonafideRequest];
        const bValue = b[sortConfig.key as keyof BonafideRequest];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [allRequests, statusFilter, searchQuery, sortConfig]);

  const dashboardData = useStudentDashboardData(allRequests);

  const handleNewRequestClick = () => {
    setRequestToEdit(null);
    setIsApplyDialogOpen(true);
  };

  const handleEditRequest = (request: BonafideRequest) => {
    setRequestToEdit(request);
    setIsApplyDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
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
    isApplyDialogOpen,
    setIsApplyDialogOpen,
    requestToEdit,
    requestToCancel,
    setRequestToCancel,
    isCancelling,
    dashboardData,
    handleNewRequestClick,
    handleEditRequest,
    handleConfirmCancel,
    handleClearFilters,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
    requests: filteredAndSortedRequests,
    isLoading,
  };
};