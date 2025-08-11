import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffPortalLogic } from "@/hooks/useStaffPortalLogic";
import { useStaffPortalData } from "@/hooks/useStaffPortalData";

const TutorPortal = () => {
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

  const {
    stats,
    charts,
    allRequests,
    requests,
    isLoading,
    handleAction,
    handleBulkAction,
  } = useStaffPortalData({
    role: 'tutor',
    dateRange,
    searchQuery,
    statusFilter,
    sortConfig,
    departmentFilter,
    onRealtimeEvent: handleRealtimeEvent,
  });

  return (
    <StaffDashboard
      title="Tutor Dashboard"
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

export default TutorPortal;