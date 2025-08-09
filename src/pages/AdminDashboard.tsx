import { useMemo } from "react";
import { Link } from "react-router-dom";
import { StaffRequestsTable } from "@/components/StaffRequestsTable";
import { BonafideRequest, BonafideStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/StatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { RequestsChart } from "@/components/RequestsChart";
import { DepartmentDistributionChart } from "@/components/DepartmentDistributionChart";
import { format, parseISO } from "date-fns";

const AdminDashboard = () => {
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
    pending: requests.filter((r) => r.status === "approved_by_hod").length,
    completed: requests.filter((r) => r.status === "completed").length,
    totalRejected: requests.filter((r) =>
      ["rejected_by_tutor", "rejected_by_hod"].includes(r.status),
    ).length,
  }), [requests]);

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

  const departmentChartData = useMemo(() => {
    const departmentCounts: { [key: string]: number } = {};

    requests.forEach((request) => {
      const department = request.profiles?.department || "Unknown";
      if (departmentCounts[department]) {
        departmentCounts[department] += 1;
      } else {
        departmentCounts[department] = 1;
      }
    });

    return Object.entries(departmentCounts).map(([name, value]) => ({
      name,
      value,
    })).sort((a, b) => b.value - a.value);
  }, [requests]);

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
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Requests</CardTitle>
                <CardDescription>
                  Total requests submitted per month this year.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <RequestsChart data={monthlyChartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Requests by Department</CardTitle>
                <CardDescription>
                  Distribution of all requests across departments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentDistributionChart data={departmentChartData} />
              </CardContent>
            </Card>
          </div>
          <StaffRequestsTable
            requests={requests}
            onAction={handleAction}
            onBulkAction={handleBulkAction}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;