import { StaffRequestsTable } from "@/components/StaffRequestsTable";
import { BonafideRequest, BonafideStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/StatsCard";
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

const HodPortal = () => {
  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<BonafideRequest>) => {
    if (payload.eventType === 'UPDATE' && payload.new.status === 'approved_by_tutor') {
      showSuccess("A request requires your approval.");
    }
  };

  const { requests, isLoading, updateRequest, bulkUpdateRequest } = useBonafideRequests(
    "public:bonafide_requests:hod",
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

  const handleBulkAction = async (
    requestIds: string[],
    newStatus: BonafideStatus,
    rejectionReason?: string,
  ) => {
    await bulkUpdateRequest({ requestIds, newStatus, rejectionReason });
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "approved_by_tutor").length,
    approved: requests.filter((r) => r.status === "approved_by_hod").length,
    rejected: requests.filter((r) => r.status === "rejected_by_hod").length,
  };

  return (
    <DashboardLayout title="HOD Dashboard">
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
              title="Pending Your Approval"
              value={stats.pending}
              icon={Clock}
            />
            <StatsCard
              title="Approved by You"
              value={stats.approved}
              icon={CheckCircle}
            />
            <StatsCard
              title="Rejected by You"
              value={stats.rejected}
              icon={XCircle}
            />
          </div>
          <StaffRequestsTable requests={requests} onAction={handleAction} onBulkAction={handleBulkAction} />
        </div>
      )}
    </DashboardLayout>
  );
};

export default HodPortal;