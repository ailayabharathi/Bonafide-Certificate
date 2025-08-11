import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { useStaffDashboardData } from "./useStaffDashboardData";
import { DateRange } from "react-day-picker";
import { SortConfig, BonafideRequestWithProfile } from "@/types";

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

  // Data fetching for dashboard stats and charts
  const { data: dashboardSourceData, isLoading: isSourceDataLoading } = useQuery({
    queryKey: ['allDashboardData', role, dateRange],
    queryFn: () => fetchAllDashboardData(role),
    enabled: !!profile,
  });

  // Data processing for charts and stats
  const { stats, charts } = useStaffDashboardData(
    dashboardSourceData?.allRequests || [], 
    profile, 
    dashboardSourceData?.allUsers || [], 
    dateRange
  );

  return {
    stats,
    charts,
    allRequests: dashboardSourceData?.allRequests || [],
    isLoading: isSourceDataLoading,
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