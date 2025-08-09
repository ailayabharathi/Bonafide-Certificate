import { Link } from "react-router-dom";
import { BonafideRequest, BonafideStatus } from "@/types";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffDashboardData } from "@/hooks/useStaffDashboardData";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const { profile } = useAuth();

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

  const { requests, isLoading, updateRequest, bulkUpdateRequest } =
    useBonafideRequests(
      "public:bonafide_requests:admin",
      undefined,
      handleRealtimeEvent,
    );

  const { stats, charts } = useStaffDashboardData(requests, profile);

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
      isLoading={isLoading}
      onAction={handleAction}
      onBulkAction={handleBulkAction}
    />
  );
};

export default AdminDashboard;