import { useMemo } from "react";
import { BonafideRequest, BonafideStatus } from "@/types";
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { StatusDistributionChart } from "@/components/StatusDistributionChart";
import { RequestsChart } from "@/components/RequestsChart";
import { format, parseISO } from "date-fns";
import { StaffDashboard } from "@/components/StaffDashboard";

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

  const stats = useMemo(() => ([
    { title: "Total Requests", value: requests.length, icon: ClipboardList },
    { title: "Pending Your Action", value: requests.filter((r) => r.status === "pending").length, icon: Clock },
    { title: "Approved by You", value: requests.filter((r) => r.status === "approved_by_tutor").length, icon: CheckCircle },
    { title: "Rejected by You", value: requests.filter((r) => r.status === "rejected_by_tutor").length, icon: XCircle },
  ]), [requests]);

  const charts = useMemo(() => {
    const statusChartData = [
      { name: 'Pending', value: stats[1].value as number },
      { name: 'Approved', value: stats[2].value as number },
      { name: 'Rejected', value: stats[3].value as number },
    ];

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

    return [
      {
        id: 'status',
        component: StatusDistributionChart,
        props: { data: statusChartData },
        card: {
          title: "Status Overview",
          description: "A breakdown of requests you've processed.",
        }
      },
      {
        id: 'monthly',
        component: RequestsChart,
        props: { data: monthlyData },
        card: {
          title: "Monthly Requests",
          description: "Requests submitted per month this year.",
          contentClassName: "pl-2",
        }
      }
    ];
  }, [requests, stats]);

  return (
    <StaffDashboard
      title="Tutor Dashboard"
      stats={stats}
      charts={charts}
      requests={requests}
      isLoading={isLoading}
      onAction={handleAction}
      onBulkAction={handleBulkAction}
    />
  );
};

export default TutorPortal;