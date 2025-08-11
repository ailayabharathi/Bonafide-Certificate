import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { useBonafideRequests } from "./useBonafideRequests";
import { useStaffDashboardData } from "./useStaffDashboardData";
import { DateRange } from "react-day-picker";
import { BonafideStatus, SortConfig, BonafideRequestWithProfile } from "@/types";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

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

interface UseStaffPortalDataProps {
  role: Profile['role'];
  dateRange?: DateRange;
  searchQuery: string;
  statusFilter: string;
  sortConfig: SortConfig;
  departmentFilter: string;
  onRealtimeEvent: (payload: RealtimePostgresChangesPayload<any>) => void;
}

export const useStaffPortalData = ({
  role,
  dateRange,
  searchQuery,
  statusFilter,
  sortConfig,
  departmentFilter,
  onRealtimeEvent,
}: UseStaffPortalDataProps) => {
  const { profile } = useAuth();

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

  const { stats, charts } = useStaffDashboardData(
    dashboardSourceData?.allRequests || [], 
    profile, 
    dashboardSourceData?.allUsers || [], 
    dateRange
  );

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
    handleAction,
    handleBulkAction,
  };
};