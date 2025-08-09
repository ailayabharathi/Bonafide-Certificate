import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BonafideRequest, BonafideStatus } from "@/types";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { RequestsChart } from "@/components/RequestsChart";
import { DepartmentDistributionChart } from "@/components/DepartmentDistributionChart";
import { format, parseISO } from "date-fns";
import { StaffDashboard } from "@/components/StaffDashboard";

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

  const stats = useMemo(() => ([
    { title: "Total Requests", value: requests.length, icon: ClipboardList },
    { title: "Pending Final Processing", value: requests.filter((r) => r.status === "approved_by_hod").length, icon: Clock },
    { title: "Completed Certificates", value: requests.filter((r) => r.status === "completed").length, icon: CheckCircle },
    { title: "Total Rejected", value: requests.filter((r) => ["rejected_by_tutor", "rejected_by_hod"].includes(r.status)).length, icon: XCircle },
  ]), [requests]);

  const charts = useMemo(() => {
    const monthlyChartData = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(0, i), "MMM"),
      total: 0,
    }));
    requests.forEach((request) => {
      if (new Date(request.created_at).getFullYear() === new Date().getFullYear()) {
        const monthIndex = parseISO(request.created_at).getMonth();
        monthlyChartData[monthIndex].total += 1;
      }
    });

    const departmentCounts: { [key: string]: number } = {};
    requests.forEach((request) => {
      const department = request.profiles?.department || "Unknown";
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });
    const departmentChartData = Object.entries(departmentCounts).map(([name, value]) => ({
      name,
      value,
    })).sort((a, b) => b.value - a.value);

    return [
      {
        id: 'monthly',
        component: RequestsChart,
        props: { data: monthlyChartData },
        card: {
          title: "Monthly Requests",
          description: "Total requests submitted per month this year.",
          contentClassName: "pl-2",
        }
      },
      {
        id: 'department',
        component: DepartmentDistributionChart,
        props: { data: departmentChartData },
        card: {
          title: "Requests by Department",
          description: "Distribution of all requests across departments.",
        }
      }
    ];
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