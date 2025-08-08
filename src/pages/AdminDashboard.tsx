import { Link } from "react-router-dom";
import { StaffRequestsTable } from "@/components/StaffRequestsTable";
import { BonafideRequest, BonafideStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/StatsCard";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

const AdminDashboard = () => {
  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<BonafideRequest>) => {
    if (payload.eventType === 'UPDATE' && payload.new.status === 'approved_by_hod') {
      showSuccess("A request is ready for final processing.");
    }
  };

  const { requests, isLoading, updateRequest } = useBonafideRequests(
    "public:bonafide_requests:admin",
    undefined,
    handleRealtimeEvent
  );

  const handleAction = async (
    requestId: string,
    newStatus: BonafideStatus,
    rejectionReason?: string,
  ) => {
    await updateRequest({ requestId, newStatus, rejectionReason });
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "approved_by_hod").length,
    completed: requests.filter((r) => r.status === "completed").length,
    totalRejected: requests.filter((r) =>
      ["rejected_by_tutor", "rejected_by_hod"].includes(r.status),
    ).length,
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
    <DashboardLayout title="Admin Dashboard" headerActions={headerActions}>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Requests"
              value={stats.total}
              icon={ClipboardList}
            />
            <StatsCard
              title="Pending Final Processing"
              value={stats.pending}
              icon={Clock}
            />
            <StatsCard
              title="Completed Certificates"
              value={stats.completed}
              icon={CheckCircle}
            />
            <StatsCard
              title="Total Rejected"
              value={stats.totalRejected}
              icon={XCircle}
            />
          </div>
          <StaffRequestsTable requests={requests} onAction={handleAction} />
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;