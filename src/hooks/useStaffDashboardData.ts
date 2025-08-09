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

  const statusCounts = useMemo(() => {
    const counts = {
      total: filteredRequests.length,
      pending: 0,
      approved_by_tutor: 0,
      rejected_by_tutor: 0,
      approved_by_hod: 0,
      rejected_by_hod: 0,
      completed: 0,
    };

    filteredRequests.forEach(request => {
      counts.total++;
      switch (request.status) {
        case 'pending': counts.pending++; break;
        case 'approved_by_tutor': counts.approved_by_tutor++; break;
        case 'rejected_by_tutor': counts.rejected_by_tutor++; break;
        case 'approved_by_hod': counts.approved_by_hod++; break;
        case 'rejected_by_hod': counts.rejected_by_hod++; break;
        case 'completed': counts.completed++; break;
      }
    });
    return counts;
  }, [filteredRequests]);

  const stats = useMemo(() => {
    if (!profile) return [];

    switch (profile.role) {
      case "tutor":
        return [
          { title: "Total Requests", value: statusCounts.total, icon: ClipboardList },
          { title: "Pending Your Action", value: statusCounts.pending, icon: Clock },
          { title: "Approved by You", value: statusCounts.approved_by_tutor, icon: CheckCircle },
          { title: "Rejected by You", value: statusCounts.rejected_by_tutor, icon: XCircle },
        ];
      case "hod":
        return [
          { title: "Total Requests", value: statusCounts.total, icon: ClipboardList },
          { title: "Pending Your Approval", value: statusCounts.approved_by_tutor, icon: Clock },
          { title: "Approved by You", value: statusCounts.approved_by_hod, icon: CheckCircle },
          { title: "Rejected by You", value: statusCounts.rejected_by_hod, icon: XCircle },
        ];
      case "admin":
        return [
          { title: "Total Users", value: allUsers.length, icon: Users },
          { title: "Total Requests", value: statusCounts.total, icon: ClipboardList },
          { title: "Pending Final Processing", value: statusCounts.approved_by_hod, icon: Clock },
          { title: "Completed Certificates", value: statusCounts.completed, icon: CheckCircle },
          { title: "Total Rejected", value: statusCounts.rejected_by_tutor + statusCounts.rejected_by_hod, icon: XCircle },
        ];
      default:
        return [];
    }
  }, [profile, statusCounts, allUsers]);

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
        { name: 'Pending', value: (profile.role === 'tutor' ? statusCounts.pending : statusCounts.approved_by_tutor) },
        { name: 'Approved', value: (profile.role === 'tutor' ? statusCounts.approved_by_tutor : statusCounts.approved_by_hod) },
        { name: 'Rejected', value: (profile.role === 'tutor' ? statusCounts.rejected_by_tutor : statusCounts.rejected_by_hod) },
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
  }, [filteredRequests, profile, allUsers]);

  return { stats, charts };
};