import { useMemo } from "react";
import { StaffRequestsTable } from "@/components/StaffRequestsTable";
import { BonafideRequest, BonafideStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/StatsCard";
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { StatusDistributionChart } from "@/components/StatusDistributionChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RequestsChart } from "@/components/RequestsChart";
import { format, parseISO } from "date-fns";

const TutorPortal = () => {
  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<BonafideRequest>) => {
    if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
      showSuccess("New request received for your review.");
    }
  };

  const { requests, isLoading, updateRequest, bulkUpdateRequest } = useBonafideRequests(
    "public:bonafide_requests:tutor",
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

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved_by_tutor").length,
    rejected: requests.filter((r) => r.status === "rejected_by_tutor").length,
  }), [requests]);

  const statusChartData = useMemo(() => [
    { name: 'Pending', value: stats.pending },
    { name: 'Approved', value: stats.approved },
    { name: 'Rejected', value: stats.rejected },
  ], [stats]);

  const monthlyChartData = useMemo(() => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(0, i), "MMM"),
      total: 0,
    }));

    requests.forEach((request) => {
      if (new Date(request.created_at).getFullYear() === new Date().getFullYear()) {
        const monthIndex = parseISO(request.created_at).getMonth();
        monthlyData[monthIndex].total += 1;
      }
    });

    return monthlyData;
  }, [requests]);

  return (
    <DashboardLayout title="Tutor Dashboard">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
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
              title="Pending Your Action"
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
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
                <CardDescription>A breakdown of requests you've processed.</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusDistributionChart data={statusChartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Requests</CardTitle>
                <CardDescription>Requests submitted per month this year.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <RequestsChart data={monthlyChartData} />
              </CardContent>
            </Card>
          </div>
          <StaffRequestsTable requests={requests} onAction={handleAction} onBulkAction={handleBulkAction} />
        </div>
      )}
    </DashboardLayout>
  );
};

export default TutorPortal;