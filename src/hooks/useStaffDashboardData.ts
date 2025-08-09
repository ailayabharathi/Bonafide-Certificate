import { useMemo } from "react";
import { BonafideRequestWithProfile } from "@/types";
import { Profile } from "@/contexts/AuthContext";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { StatusDistributionChart } from "@/components/StatusDistributionChart";
import { RequestsChart } from "@/components/RequestsChart";
import { DepartmentDistributionChart } from "@/components/DepartmentDistributionChart";
import { format, parseISO, isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

export const useStaffDashboardData = (
  requests: BonafideRequestWithProfile[],
  profile: Profile | null,
  allUsers: Profile[] = [],
  dateRange?: DateRange,
) => {
  const filteredRequests = useMemo(() => {
    if (!dateRange?.from) {
      return requests;
    }
    const { from, to } = dateRange;
    return requests.filter(request => {
      const createdAt = parseISO(request.created_at);
      return isWithinInterval(createdAt, { start: from, end: to || new Date() });
    });
  }, [requests, dateRange]);

  const stats = useMemo(() => {
    if (!profile) return [];

    switch (profile.role) {
      case "tutor":
        return [
          { title: "Total Requests", value: filteredRequests.length, icon: ClipboardList },
          { title: "Pending Your Action", value: filteredRequests.filter((r) => r.status === "pending").length, icon: Clock },
          { title: "Approved by You", value: filteredRequests.filter((r) => r.status === "approved_by_tutor").length, icon: CheckCircle },
          { title: "Rejected by You", value: filteredRequests.filter((r) => r.status === "rejected_by_tutor").length, icon: XCircle },
        ];
      case "hod":
        return [
          { title: "Total Processed by You", value: filteredRequests.filter(r => ['approved_by_hod', 'rejected_by_hod'].includes(r.status)).length, icon: ClipboardList },
          { title: "Pending Your Approval", value: filteredRequests.filter((r) => r.status === "approved_by_tutor").length, icon: Clock },
          { title: "Approved by You", value: filteredRequests.filter((r) => r.status === "approved_by_hod").length, icon: CheckCircle },
          { title: "Rejected by You", value: filteredRequests.filter((r) => r.status === "rejected_by_hod").length, icon: XCircle },
        ];
      case "admin":
        return [
          { title: "Total Users", value: allUsers.length, icon: Users },
          { title: "Total Requests", value: filteredRequests.length, icon: ClipboardList },
          { title: "Pending Final Processing", value: filteredRequests.filter((r) => r.status === "approved_by_hod").length, icon: Clock },
          { title: "Completed Certificates", value: filteredRequests.filter((r) => r.status === "completed").length, icon: CheckCircle },
        ];
      default:
        return [];
    }
  }, [filteredRequests, profile, allUsers]);

  const charts = useMemo(() => {
    if (!profile) return [];

    const monthlyChartData = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(0, i), "MMM"),
      total: 0,
    }));
    filteredRequests.forEach((request) => {
      if (new Date(request.created_at).getFullYear() === new Date().getFullYear()) {
        const monthIndex = parseISO(request.created_at).getMonth();
        monthlyChartData[monthIndex].total += 1;
      }
    });

    if (profile.role === "admin") {
      const departmentCounts: { [key: string]: number } = {};
      filteredRequests.forEach((request) => {
        const department = request.profiles?.department || "Unknown";
        departmentCounts[department] = (departmentCounts[department] || 0) + 1;
      });
      const departmentChartData = Object.entries(departmentCounts).map(([name, value]) => ({
        name,
        value,
      })).sort((a, b) => b.value - a.value);

      const roleCounts: { [key: string]: number } = {};
      allUsers.forEach((user) => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      });
      const roleChartData = Object.entries(roleCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      return [
        {
          id: 'monthly',
          component: RequestsChart,
          props: { data: monthlyChartData },
          card: {
            title: "Monthly Requests",
            description: "Total requests submitted per month this year.",
            className: "lg:col-span-2",
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
        },
        {
          id: 'roles',
          component: DepartmentDistributionChart,
          props: { data: roleChartData },
          card: {
            title: "User Role Distribution",
            description: "A breakdown of all user roles in the system.",
          }
        }
      ];
    }

    if (profile.role === "tutor" || profile.role === "hod") {
      const statusChartData = [
        { name: 'Pending', value: (stats[1]?.value as number) || 0 },
        { name: 'Approved', value: (stats[2]?.value as number) || 0 },
        { name: 'Rejected', value: (stats[3]?.value as number) || 0 },
      ];
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
          props: { data: monthlyChartData },
          card: {
            title: "Monthly Requests",
            description: "Requests submitted per month this year.",
            contentClassName: "pl-2",
          }
        }
      ];
    }

    return [];
  }, [filteredRequests, profile, stats, allUsers]);

  return { stats, charts };
};