import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BonafideRequest, BonafideStatus, SortConfig } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { useStudentDashboardData } from "@/hooks/useStudentDashboardData";
import { useDebounce } from "./useDebounce";
import { exportToCsv } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export const useStudentPortalLogic = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // UI State
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<BonafideRequest | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<BonafideRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering and Sorting State
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Reset page on filter/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchQuery, sortConfig]);

  // Single data fetch for all requests
  const { data: allRequests = [], isLoading } = useQuery({
    queryKey: ['bonafide_requests', 'all_for_student', user?.id],
    queryFn: async (): Promise<BonafideRequest[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bonafide_requests')
        .select('*')
        .eq('user_id', user.id);
      if (error) {
        showError("Failed to load requests.");
        return [];
      }
      return data;
    },
    enabled: !!user,
  });

  // Client-side filtering
  const filteredRequests = useMemo(() => {
    return allRequests.filter(request => {
      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'in_progress' && ['pending', 'approved_by_tutor', 'approved_by_hod'].includes(request.status)) ||
        (statusFilter === 'rejected' && ['rejected_by_tutor', 'rejected_by_hod'].includes(request.status)) ||
        request.status === statusFilter;

      const searchMatch = !debouncedSearchQuery ||
        request.reason.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [allRequests, statusFilter, debouncedSearchQuery]);

  // Client-side sorting
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      const key = sortConfig.key as keyof BonafideRequest;
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === null || bValue === null) return 0;

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }
      return sortConfig.direction === 'descending' ? comparison * -1 : comparison;
    });
  }, [filteredRequests, sortConfig]);

  // Client-side pagination
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedRequests.slice(start, end);
  }, [sortedRequests, currentPage]);

  const totalPages = Math.ceil(sortedRequests.length / ITEMS_PER_PAGE);

  // Dashboard data derived from the single fetch
  const dashboardData = useStudentDashboardData(allRequests);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (requestId: string) => supabase.from("bonafide_requests").delete().eq("id", requestId),
    onSuccess: () => {
      showSuccess("Request cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ['bonafide_requests', 'all_for_student', user?.id] });
    },
    onError: (error: any) => showError(error.message || "Failed to cancel request."),
  });

  // Handlers
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
    await deleteMutation.mutateAsync(requestToCancel.id);
    setRequestToCancel(null);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  const [isExporting, setIsExporting] = useState(false);
  const handleExport = () => {
    setIsExporting(true);
    try {
      if (sortedRequests.length === 0) {
        showError("No data to export for the current filters.");
        return;
      }
      const dataToExport = sortedRequests.map(req => ({
        id: req.id,
        reason: req.reason,
        status: req.status,
        rejection_reason: req.rejection_reason || '',
        submitted_at: new Date(req.created_at).toISOString(),
        last_updated_at: new Date(req.updated_at).toISOString(),
      }));
      exportToCsv(`my-requests-${new Date().toISOString().split('T')[0]}.csv`, dataToExport);
      showSuccess("Data exported successfully!");
    } catch (error: any) {
      showError(error.message || "Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isApplyDialogOpen,
    setIsApplyDialogOpen,
    requestToEdit,
    requestToCancel,
    setRequestToCancel,
    isCancelling: deleteMutation.isPending,
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
    requests: paginatedRequests,
    isLoading,
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
    isExporting,
    handleExport,
  };
};