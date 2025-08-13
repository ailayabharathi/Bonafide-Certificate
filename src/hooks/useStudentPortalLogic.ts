import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BonafideRequest, BonafideStatus, SortConfig } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useStudentDashboardData } from "@/hooks/useStudentDashboardData";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { useDebounce } from "./useDebounce";

const ITEMS_PER_PAGE = 10;

export const useStudentPortalLogic = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State for UI controls
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<BonafideRequest | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<BonafideRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // State for data filtering and sorting
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchQuery, sortConfig]);

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

  // Fetch all requests for the dashboard stats and charts
  const { data: allRequests = [], isLoading: isDashboardDataLoading } = useQuery({
    queryKey: ['bonafide_requests', 'dashboard', user?.id],
    queryFn: async (): Promise<BonafideRequest[]> => {
        if (!user) return [];
        const { data, error } = await supabase.from('bonafide_requests').select('*').eq('user_id', user.id);
        if (error) {
            showError("Failed to load dashboard data.");
            return [];
        }
        return data;
    },
    enabled: !!user,
  });
  const dashboardData = useStudentDashboardData(allRequests);

  // Fetch filtered and sorted requests for the table view
  const { 
    requests: tableRequests, 
    count: totalCount, 
    isLoading: isTableDataLoading, 
    deleteRequest: deleteRequestFn,
    exportData,
    isExporting,
  } = useBonafideRequests(
    `student-requests:${user?.id}`,
    { 
      userId: user?.id,
      statusFilter,
      searchQuery: debouncedSearchQuery,
      sortConfig,
      page: currentPage,
    },
    handleRealtimeEvent
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
    requests: tableRequests,
    isLoading: isDashboardDataLoading || isTableDataLoading,
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
    isExporting,
    handleExport: exportData,
  };
};