import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffPortalLogic } from "@/hooks/useStaffPortalLogic";
import { useStaffPortalData } from "@/hooks/useStaffPortalData";

const AdminDashboard = () => {
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

  const {
    stats,
    charts,
    allRequests,
    requests,
    isLoading,
    handleAction,
    handleBulkAction,
  } = useStaffPortalData({
    role: 'admin',
    dateRange,
    searchQuery,
    statusFilter,
    sortConfig,
    departmentFilter,
    onRealtimeEvent: handleRealtimeEvent,
  });

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
      allRequests={allRequests}
      requests={requests}
      isLoading={isLoading}
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