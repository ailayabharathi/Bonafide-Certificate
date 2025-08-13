import { useMemo } from "react";
import { BonafideRequest } from "@/types";
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";

export const useStudentDashboardData = (requests: BonafideRequest[]) => {
  const statsData = useMemo(() => {
    return {
      total: requests.length,
      inProgress: requests.filter(r => ['pending', 'approved_by_tutor', 'approved_by_hod'].includes(r.status)).length,
      completed: requests.filter(r => r.status === 'completed').length,
      rejected: requests.filter(r => ['rejected_by_tutor', 'rejected_by_hod'].includes(r.status)).length,
    };
  }, [requests]);

  const stats = useMemo(() => [
    { title: "Total Requests", value: statsData.total, icon: ClipboardList },
    { title: "In Progress", value: statsData.inProgress, icon: Clock },
    { title: "Completed", value: statsData.completed, icon: CheckCircle },
    { title: "Rejected", value: statsData.rejected, icon: XCircle },
  ], [statsData]);

  const chartData = useMemo(() => [
    { name: 'In Progress', value: statsData.inProgress },
    { name: 'Completed', value: statsData.completed },
    { name: 'Rejected', value: statsData.rejected },
  ], [statsData]);

  return { stats, chartData };
};