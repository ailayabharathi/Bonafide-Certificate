import { Link } from "react-router-dom";
import { BonafideRequest, BonafideStatus } from "@/types";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffDashboardData } from "@/hooks/useStaffDashboardData";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { DateRange } from "react-day-picker";

const fetchAllUsers = async (): Promise<Profile[]> => {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) {
    console.error("Failed to fetch users for dashboard", error);
    return [];
  }
  return data || [];
};

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleRealtimeEvent = (
    payload: RealtimePostgresChangesPayload<BonafideRequest>,
  ) => {
    if (
      payload.eventType === "UPDATE" &&
      payload.new.status === "approved_by_hod"
    ) {
      showSuccess("A request is ready for final processing.");
    }
  };

  const {
    requests,
    isLoading: requestsLoading,
    updateRequest,
    bulkUpdateRequest,
  } = useBonafideRequests(
    "public:bonafide_requests:admin",
    undefined,
    handleRealtimeEvent,
    dateRange?.from,
    dateRange?.to,
  );

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<Profile[]>({
    queryKey: ["allUsers"],
    queryFn: fetchAllUsers,
    enabled: profile?.role === "admin",
  });

  const { stats, charts } = useStaffDashboardData(requests, profile, allUsers, dateRange);

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
      requests={requests}
      isLoading={requestsLoading || usersLoading}
      onAction={handleAction}
      onBulkAction={handleBulkAction}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
    />
  );
};

export default AdminDashboard;