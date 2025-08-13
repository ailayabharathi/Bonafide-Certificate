import { useState, useMemo, useEffect, useCallback } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardAnalytics } from "./useDashboardAnalytics";
import { useDebounce } from "./useDebounce";
import { BonafideRequestWithProfile, BonafideStatus, SortConfig } from "@/types";
import { showSuccess, showError } from "@/utils/toast";
import { exportToCsv } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export const useStaffDashboardLogic = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState(location.state?.initialSearch || "");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState(location.state?.initialTab || "actionable");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Dialog states
  const [actionRequest, setActionRequest] = useState<BonafideRequestWithProfile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revert' | null>(null);
  const [isBulk, setIsBulk] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [studentUserIdToView, setStudentUserIdToView] = useState<string | null>(null);

  // --- DATA FETCHING & PROCESSING ---
  const { stats, charts, requests: allRequests, isLoading: isAnalyticsLoading } = useDashboardAnalytics(profile, dateRange);

  // Clear initial navigation state after using it
  useEffect(() => {
    if (location.state?.initialSearch || location.state?.initialTab) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Reset page and selection when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [activeTab, debouncedSearchQuery, departmentFilter, sortConfig, dateRange]);

  const tabCounts = useMemo(() => {
    const counts = { actionable: 0, inProgress: 0, completed: 0, rejected: 0, all: allRequests.length };
    if (!profile) return counts;

    const actionableStatuses = {
      tutor: ['pending'],
      hod: ['approved_by_tutor'],
      admin: ['approved_by_hod'],
    }[profile.role] || [];

    allRequests.forEach(req => {
      if (actionableStatuses.includes(req.status)) counts.actionable++;
      if (['pending', 'approved_by_tutor', 'approved_by_hod'].includes(req.status)) counts.inProgress++;
      if (req.status === 'completed') counts.completed++;
      if (['rejected_by_tutor', 'rejected_by_hod'].includes(req.status)) counts.rejected++;
    });
    return counts;
  }, [allRequests, profile]);

  const filteredRequests = useMemo(() => {
    const statusMap: { [key: string]: BonafideStatus[] } = {
      actionable: ({
        tutor: ['pending'],
        hod: ['approved_by_tutor'],
        admin: ['approved_by_hod'],
      }[profile?.role || ''] || []) as BonafideStatus[],
      inProgress: ['pending', 'approved_by_tutor', 'approved_by_hod'],
      completed: ['completed'],
      rejected: ['rejected_by_tutor', 'rejected_by_hod'],
    };
    const statusesToFilter = statusMap[activeTab] || [];

    return allRequests.filter(request => {
      if (activeTab !== 'all' && !statusesToFilter.includes(request.status)) return false;
      if (departmentFilter !== 'all' && request.profiles?.department !== departmentFilter) return false;
      if (debouncedSearchQuery) {
        const search = debouncedSearchQuery.toLowerCase();
        const nameMatch = `${request.profiles?.first_name || ''} ${request.profiles?.last_name || ''}`.toLowerCase().includes(search);
        const regMatch = request.profiles?.register_number?.toLowerCase().includes(search);
        const reasonMatch = request.reason.toLowerCase().includes(search);
        if (!(nameMatch || regMatch || reasonMatch)) return false;
      }
      return true;
    });
  }, [allRequests, activeTab, departmentFilter, debouncedSearchQuery, profile]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      const key = sortConfig.key as keyof BonafideRequest;
      const aValue = a[key];
      const bValue = b[key];
      if (aValue === null || bValue === null) return 0;
      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      else if (aValue < bValue) comparison = -1;
      return sortConfig.direction === 'descending' ? comparison * -1 : comparison;
    });
  }, [filteredRequests, sortConfig]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedRequests.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedRequests, currentPage]);

  const totalPages = Math.ceil(sortedRequests.length / ITEMS_PER_PAGE);

  // --- MUTATIONS ---
  const updateMutation = useMutation({
    mutationFn: async (vars: { requestId: string; newStatus: BonafideStatus; rejectionReason?: string }) => {
      const { error } = await supabase.from("bonafide_requests").update({ status: vars.newStatus, rejection_reason: vars.rejectionReason || null }).eq("id", vars.requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Request updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
    },
    onError: (error: any) => showError(error.message || "Failed to update request."),
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (vars: { requestIds: string[]; newStatus: BonafideStatus; rejectionReason?: string }) => {
      const updates = vars.requestIds.map(id => supabase.from("bonafide_requests").update({ status: vars.newStatus, rejection_reason: vars.rejectionReason || null }).eq("id", id));
      const results = await Promise.all(updates);
      const firstError = results.find(res => res.error);
      if (firstError?.error) throw firstError.error;
    },
    onSuccess: (_, vars) => {
      showSuccess(`${vars.requestIds.length} requests updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
    },
    onError: (error: any) => showError(error.message || "An error occurred during bulk update."),
  });

  // --- ACTIONS & HANDLERS ---
  const openActionDialog = useCallback((type: 'approve' | 'reject' | 'revert', bulk: boolean, request?: BonafideRequestWithProfile) => {
    setActionType(type);
    setIsBulk(bulk);
    setActionRequest(request || null);
  }, []);

  const closeActionDialog = useCallback(() => {
    setActionRequest(null);
    setActionType(null);
    setIsBulk(false);
  }, []);

  const handleConfirmAction = useCallback(async (rejectionReason?: string) => {
    if (!actionType || !profile) return;
    if (!isBulk && !actionRequest) return;
    if (isBulk && selectedIds.length === 0) return;

    let newStatus: BonafideStatus;
    if (actionType === 'approve') {
      if (profile.role === 'tutor') newStatus = 'approved_by_tutor';
      else if (profile.role === 'hod') newStatus = 'approved_by_hod';
      else if (profile.role === 'admin') newStatus = 'completed';
      else return;
    } else if (actionType === 'revert') {
      if (profile.role !== 'admin') return;
      newStatus = 'approved_by_hod';
    } else { // reject
      if (profile.role === 'tutor') newStatus = 'rejected_by_tutor';
      else if (profile.role === 'hod') newStatus = 'rejected_by_hod';
      else return;
    }

    if (isBulk) {
      await bulkUpdateMutation.mutateAsync({ requestIds: selectedIds, newStatus, rejectionReason });
      setSelectedIds([]);
    } else if (actionRequest) {
      await updateMutation.mutateAsync({ requestId: actionRequest.id, newStatus, rejectionReason });
    }
    closeActionDialog();
  }, [actionType, profile, isBulk, actionRequest, selectedIds, bulkUpdateMutation, updateMutation, closeActionDialog]);

  const handleViewProfile = useCallback((userId: string) => {
    setStudentUserIdToView(userId);
    setIsProfileDialogOpen(true);
  }, []);

  const handleClearFilters = () => {
    setDateRange(undefined);
    setSearchQuery("");
    setDepartmentFilter("all");
    setActiveTab("actionable");
  };

  const [isExporting, setIsExporting] = useState(false);
  const handleExport = () => {
    setIsExporting(true);
    try {
      if (sortedRequests.length === 0) {
        showError("No data to export for the current filters.");
        return;
      }
      const flattenedData = sortedRequests.map(request => ({
        id: request.id,
        student_name: `${request.profiles?.first_name || ''} ${request.profiles?.last_name || ''}`,
        register_number: request.profiles?.register_number || '',
        department: request.profiles?.department || '',
        reason: request.reason,
        status: request.status,
        rejection_reason: request.rejection_reason || '',
        submitted_at: new Date(request.created_at).toISOString(),
        last_updated_at: new Date(request.updated_at).toISOString(),
      }));
      exportToCsv(`bonafide-requests-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`, flattenedData);
      showSuccess("Data exported successfully!");
    } catch (error: any) {
      showError(error.message || "An error occurred during the export.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    // Data and loading
    stats,
    charts,
    requests: paginatedRequests,
    isLoading: isAnalyticsLoading,
    isMutating: updateMutation.isPending || bulkUpdateMutation.isPending,
    // Filters and state
    dateRange,
    onDateRangeChange: setDateRange,
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    departmentFilter,
    onDepartmentFilterChange: setDepartmentFilter,
    activeTab,
    onTabChange: setActiveTab,
    sortConfig,
    onSortChange: setSortConfig,
    handleClearFilters,
    // Pagination
    currentPage,
    onPageChange: setCurrentPage,
    totalPages,
    // Row selection
    selectedIds,
    setSelectedIds,
    selectableRowIds: useMemo(() => sortedRequests.map(r => r.id), [sortedRequests]),
    // Dialogs and actions
    actionRequest,
    actionType,
    isBulk,
    isProfileDialogOpen,
    studentUserIdToView,
    openActionDialog,
    closeActionDialog,
    handleConfirmAction,
    handleViewProfile,
    setIsProfileDialogOpen,
    // Exporting
    isExporting,
    handleExport,
    // Tab counts
    tabsInfo: useMemo(() => [
      { value: 'actionable', label: 'Action Required', count: tabCounts.actionable },
      { value: 'inProgress', label: 'In Progress', count: tabCounts.inProgress },
      { value: 'completed', label: 'Completed', count: tabCounts.completed },
      { value: 'rejected', label: 'Rejected', count: tabCounts.rejected },
      { value: 'all', label: 'All', count: tabCounts.all },
    ], [tabCounts]),
  };
};