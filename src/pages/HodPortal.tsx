import { BonafideRequest, BonafideStatus } from "@/types";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffDashboardData } from "@/hooks/useStaffDashboardData";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { DateRange } from "react-day-picker";

const HodPortal = () => {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<BonafideRequest>) => {
    if (payload.eventType === 'UPDATE' && payload.new.status === 'approved_by_tutor') {
      showSuccess("A request requires your approval.");
    }
  };

  const { requests, isLoading, updateRequest, bulkUpdateRequest } = useBonafideRequests(
    "public:bonafide_requests:hod",
    undefined,
    handleRealtimeEvent,
    dateRange?.from,
    dateRange?.to,
  );

  const { stats, charts } = useStaffDashboardData(requests, profile, [], dateRange);

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
      requests={requests}
      isLoading={isLoading}
      onAction={handleAction}
      onBulkAction={handleBulkAction}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
    />
  );
};

export default HodPortal;