import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/contexts/AuthContext";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { RequestsChart } from "@/components/RequestsChart";
import { DepartmentDistributionChart } from "@/components/DepartmentDistributionChart";
import { StatusDistributionChart } from "@/components/StatusDistributionChart";
import { format, parseISO, isWithinInterval, startOfYear, endOfYear } from "date-fns";
import { DateRange } from "react-day-picker";

// Define the shape of the data we fetch
type AnalyticsRequest = {
  status: string;
  created_at: string;
  profiles: { department: string | null } | null;
};
type AnalyticsUser = {
  role: Profile['role'];
};

const fetchAnalyticsData = async (role: Profile['role'], dateRange?: DateRange) => {
  const from = dateRange?.from || startOfYear(new Date());
  const to = dateRange?.to || endOfYear(new Date());

  const requestQuery = supabase
    .from("bonafide_requests")
    .select("status, created_at, profiles!inner(department)")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString());

  const requestsPromise = requestQuery;

  if (role === 'admin') {
    const usersPromise = supabase.from("profiles").select("role");
    const [requestsResult, usersResult] = await Promise.all([requestsPromise, usersPromise]);
    
    return {
      requests: (requestsResult.data as unknown as AnalyticsRequest[]) || [], // Fixed: Added unknown cast
      users: (usersResult.data as AnalyticsUser[]) || [],
    };
  }

  const { data, error } = await requestsPromise;
  if (error) console.error("Failed to fetch analytics data", error);
  return {
    requests: (data as unknown as AnalyticsRequest[]) || [], // Fixed: Added unknown cast
    users: [],
  };
};

export const useDashboardAnalytics = (profile: Profile | null, dateRange?: DateRange) => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardAnalytics', profile?.role, dateRange],
    queryFn: () => fetchAnalyticsData(profile!.role, dateRange),
    enabled: !!profile,
  });

  const requests = data?.requests || [];
  const users = data?.users || [];

  const statusCounts = useMemo(() => {
    const counts = {
      total: requests.length,
      pending: 0,
      approved_by_tutor: 0,
      rejected_by_tutor: 0,
      approved_by_hod: 0,
      rejected_by_hod: 0,
      completed: 0,
    };
    requests.forEach(request => {
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
  }, [requests]);

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
          { title: "Total Users", value: users.length, icon: Users },
          { title: "Total Requests", value: statusCounts.total, icon: ClipboardList },
          { title: "Pending Final Processing", value: statusCounts.approved_by_hod, icon: Clock },
          { title: "Completed Certificates", value: statusCounts.completed, icon: CheckCircle },
          { title: "Total Rejected", value: statusCounts.rejected_by_tutor + statusCounts.rejected_by_hod, icon: XCircle },
        ];
      default:
        return [];
    }
  }, [profile, statusCounts, users]);

  const charts = useMemo(() => {
    if (!profile) return [];

    const monthlyChartData = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(0, i), "MMM"),
      total: 0,
    }));
    requests.forEach((request) => {
      const requestDate = parseISO(request.created_at);
      if (isWithinInterval(requestDate, { start: dateRange?.from || startOfYear(new Date()), end: dateRange?.to || endOfYear(new Date()) })) {
        const monthIndex = requestDate.getMonth();
        monthlyChartData[monthIndex].total += 1;
      }
    });

    if (profile.role === "admin") {
      const departmentCounts: { [key: string]: number } = {};
      requests.forEach((request) => {
        const department = request.profiles?.department || "Unknown";
        departmentCounts[department] = (departmentCounts[department] || 0) + 1;
      });
      const departmentChartData = Object.entries(departmentCounts).map(([name, value]) => ({
        name,
        value,
      })).sort((a, b) => b.value - a.value);

      const roleCounts: { [key: string]: number } = {};
      users.forEach((user) => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      });
      const roleChartData = Object.entries(roleCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      return [
        { id: 'monthly', component: RequestsChart, props: { data: monthlyChartData }, card: { title: "Monthly Requests", description: "Total requests submitted per month in the selected range.", className: "lg:col-span-2", contentClassName: "pl-2" } },
        { id: 'department', component: DepartmentDistributionChart, props: { data: departmentChartData }, card: { title: "Requests by Department", description: "Distribution of requests across departments." } },
        { id: 'roles', component: DepartmentDistributionChart, props: { data: roleChartData }, card: { title: "User Role Distribution", description: "A breakdown of all user roles in the system." } }
      ];
    }
    
    if (profile.role === "tutor" || profile.role === "hod") {
        const statusChartData = [
          { name: 'Pending', value: (profile.role === 'tutor' ? statusCounts.pending : statusCounts.approved_by_tutor) },
          { name: 'Approved', value: (profile.role === 'tutor' ? statusCounts.approved_by_tutor : statusCounts.approved_by_hod) },
          { name: 'Rejected', value: (profile.role === 'tutor' ? statusCounts.rejected_by_tutor : statusCounts.rejected_by_hod) },
        ];
        return [
          { id: 'status', component: StatusDistributionChart, props: { data: statusChartData }, card: { title: "Status Overview", description: "A breakdown of requests you've processed." } },
          { id: 'monthly', component: RequestsChart, props: { data: monthlyChartData }, card: { title: "Monthly Requests", description: "Requests submitted per month in the selected range.", contentClassName: "pl-2" } }
        ];
      }

    return [];
  }, [requests, profile, users, dateRange]);

  return { stats, charts, isLoading };
};