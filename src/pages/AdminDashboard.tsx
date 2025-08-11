import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffDashboardData } from "@/hooks/useStaffDashboardData";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStaffPortalLogic } from "@/hooks/useStaffPortalLogic";
import { BonafideStatus, BonafideRequest } from "@/types";

const fetchAllAdminData = async () => {
  const usersPromise = supabase.from("profiles").select("*");
  const requestsPromise = supabase.from("bonafide_requests").select("*, profiles!inner(first_name, last_name, department, register_number)");
  
  const [usersResult, requestsResult] = await Promise.all([usersPromise, requestsPromise]);

  if (usersResult.error) console.error("Failed to fetch users for dashboard", usersResult.error);
  if (requestsResult.error) console.error("Failed to fetch requests for dashboard", requestsResult.error);

  return {
    allUsers: (usersResult.data as Profile[]) || [],
    allRequests: (requestsResult.data as BonafideRequest[]) || [],
  };
};

const AdminDashboard = () => {
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
  } = useStaffPortalLogic('admin');

  const { data: adminData, isLoading: allDataLoading } = useQuery({
    queryKey: ["allAdminData"],
    queryFn: fetchAllAdminData,
    enabled: profile?.role === "admin",
  });

  const { requests, isLoading: filteredRequestsLoading, updateRequest, bulkUpdateRequest } = useBonafideRequests(
    "public:bonafide_requests:admin",
    { startDate: dateRange?.from, endDate: dateRange?.to, searchQuery, statusFilter, sortConfig, departmentFilter },
    handleRealtimeEvent
  );

  const { stats, charts } = useStaffDashboardData(adminData?.allRequests || [], profile, adminData?.allUsers || [], dateRange);

  const handleAction = async (requestId: string, newStatus: BonafideStatus, rejectionReason?: string) => {
    await updateRequest({ requestId, newStatus, rejectionReason });
  };

  const handleBulkAction = async (requestIds: string[], newStatus: BonafideStatus, rejectionReason?: string) => {
    await bulkUpdateRequest({ requestIds, newStatus, rejectionReason });
  };

  const headerActions = (
    <Link to="/admin/user-management">
      <Button variant="outline">
        <Users className="mr-2 h-4 w-4" />
        Manage Users
      </Button>
    </Link>
  );

  return (
    <StaffDashboard
      title="Admin Dashboard"
      headerActions={headerActions}
      stats={stats}
      charts={charts}
      allRequests={adminData?.allRequests || []}
      requests={requests}
      isLoading={allDataLoading || filteredRequestsLoading}
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

export default AdminDashboard;