import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { useBonafideRequests } from "./useBonafideRequests";
import { useStaffDashboardData } from "./useStaffDashboardData";
import { DateRange } from "react-day-picker";
import { BonafideStatus, SortConfig, BonafideRequestWithProfile, BonafideRequest } from "@/types";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { showSuccess } from "@/utils/toast";

const fetchAllDashboardData = async (role: Profile['role']) => {
  const requestsPromise = supabase
    .from("bonafide_requests")
    .select("*, profiles!inner(first_name, last_name, department, register_number)");

  if (role === 'admin') {
    const usersPromise = supabase.from("profiles").select("*");
    const [requestsResult, usersResult] = await Promise.all([requestsPromise, usersPromise]);
    
    if (requestsResult.error) console.error("Failed to fetch requests for dashboard", requestsResult.error);
    if (usersResult.error) console.error("Failed to fetch users for dashboard", usersResult.error);

    return {
      allRequests: (requestsResult.data as BonafideRequestWithProfile[]) || [],
      allUsers: (usersResult.data as Profile[]) || [],
    };
  }

  const { data, error } = await requestsPromise;
  if (error) console.error("Failed to fetch requests for dashboard", error);
  return {
    allRequests: (data as BonafideRequestWithProfile[]) || [],
    allUsers: [],
  };
};

export const useStaffPortal = (role: Profile['role']) => {
  // State management for filters and UI
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("actionable");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });

  const { profile } = useAuth();

  const statusFilter = useMemo(() => {
    if (activeTab === 'actionable') {
      if (role === 'tutor') return 'pending';
      if (role === 'hod') return 'approved_by_tutor';
      if (role === 'admin') return 'approved_by_hod';
    }
    return activeTab;
  }, [activeTab, role]);

  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<BonafideRequest>) => {
    if (payload.eventType !== 'UPDATE' && payload.eventType !== 'INSERT') return;
    const newStatus = payload.new.status;
    let message = "";
    if (role === 'tutor' && newStatus === 'pending' && payload.eventType === 'INSERT') {
      message = "New request received for your review.";
    } else if (role === 'hod' && newStatus === 'approved_by_tutor') {
      message = "A request requires your approval.";
    } else if (role === 'admin' && newStatus === 'approved_by_hod') {
      message = "A request is ready for final processing.";
    }
    if (message) {
      showSuccess(message);
    }
  };

  // Data fetching and mutations
  const { data: dashboardSourceData, isLoading: isSourceDataLoading } = useQuery({
    queryKey: ['allDashboardData', role],
    queryFn: () => fetchAllDashboardData(role),
    enabled: !!profile,
  });

  const { 
    requests, 
    isLoading: isFilteredRequestsLoading, 
    updateRequest, 
    bulkUpdateRequest 
  } = useBonafideRequests(
    `public:bonafide_requests:${role}`,
    { 
      startDate: dateRange?.from, 
      endDate: dateRange?.to, 
      searchQuery, 
      statusFilter, 
      sortConfig, 
      departmentFilter 
    },
    onRealtimeEvent
  );

  // Data processing for charts and stats
  const { stats, charts } = useStaffDashboardData(
    dashboardSourceData?.allRequests || [], 
    profile, 
    dashboardSourceData?.allUsers || [], 
    dateRange
  );

  // Action handlers
  const handleAction = async (
    requestId: string,
    newStatus: BonafideStatus,
    rejectionReason?: string,
  ) => {
    await updateRequest({ requestId, newStatus, rejectionReason });
  };

  const handleBulkAction = async (
    requestIds: string[],
    newStatus: BonafideStatus,
    rejectionReason?: string,
  ) => {
    await bulkUpdateRequest({ requestIds, newStatus, rejectionReason });
  };

  return {
    stats,
    charts,
    allRequests: dashboardSourceData?.allRequests || [],
    requests,
    isLoading: isSourceDataLoading || isFilteredRequestsLoading,
    onAction: handleAction,
    onBulkAction: handleBulkAction,
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
  };
};