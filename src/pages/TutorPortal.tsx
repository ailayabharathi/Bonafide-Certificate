import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffDashboardData } from "@/hooks/useStaffDashboardData";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStaffPortalLogic } from "@/hooks/useStaffPortalLogic";
import { BonafideStatus } from "@/types";

const fetchAllTutorRequests = async () => {
  const { data, error } = await supabase
    .from("bonafide_requests")
    .select("*, profiles!inner(first_name, last_name, department, register_number)");
  if (error) return [];
  return data;
};

const TutorPortal = () => {
  const { profile } = useAuth();
  const {
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,
    activeTab,
    setActiveTab,
    sortConfig,
    setSortConfig,
    statusFilter,
    handleRealtimeEvent,
  } = useStaffPortalLogic('tutor');

  const { data: allRequests = [], isLoading: allRequestsLoading } = useQuery({
    queryKey: ['allTutorRequests'],
    queryFn: fetchAllTutorRequests,
  });

  const { requests, isLoading: filteredRequestsLoading, updateRequest, bulkUpdateRequest } = useBonafideRequests(
    "public:bonafide_requests:tutor",
    { startDate: dateRange?.from, endDate: dateRange?.to, searchQuery, statusFilter, sortConfig, departmentFilter },
    handleRealtimeEvent
  );

  const { stats, charts } = useStaffDashboardData(allRequests, profile, [], dateRange);

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

  return (
    <StaffDashboard
      title="Tutor Dashboard"
      stats={stats}
      charts={charts}
      allRequests={allRequests}
      requests={requests}
      isLoading={allRequestsLoading || filteredRequestsLoading}
      onAction={handleAction}
      onBulkAction={handleBulkAction}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      departmentFilter={departmentFilter}
      onDepartmentFilterChange={setDepartmentFilter}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sortConfig={sortConfig}
      onSortChange={setSortConfig}
    />
  );
};

export default TutorPortal;