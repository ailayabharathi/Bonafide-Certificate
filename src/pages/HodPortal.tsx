import { useState, useMemo } from "react";
import { BonafideRequest, BonafideStatus, SortConfig } from "@/types";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffDashboardData } from "@/hooks/useStaffDashboardData";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchAllHodRequests = async () => {
  const { data, error } = await supabase
    .from("bonafide_requests")
    .select("*, profiles!inner(first_name, last_name, department, register_number)");
  if (error) return [];
  return data;
};

const HodPortal = () => {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("actionable");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });

  const statusFilter = useMemo(() => {
    if (activeTab === 'actionable') {
      if (profile?.role === 'hod') return 'approved_by_tutor';
    }
    return activeTab;
  }, [activeTab, profile]);

  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<BonafideRequest>) => {
    if (payload.eventType === 'UPDATE' && payload.new.status === 'approved_by_tutor') {
      showSuccess("A request requires your approval.");
    }
  };

  const { data: allRequests = [], isLoading: allRequestsLoading } = useQuery({
    queryKey: ['allHodRequests'],
    queryFn: fetchAllHodRequests,
  });

  const { requests, isLoading: filteredRequestsLoading, updateRequest, bulkUpdateRequest } = useBonafideRequests(
    "public:bonafide_requests:hod",
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
      title="HOD Dashboard"
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

export default HodPortal;