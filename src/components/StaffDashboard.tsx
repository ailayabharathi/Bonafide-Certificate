import { ReactNode, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StaffRequestsManager } from "@/components/StaffRequestsManager";
import { SortConfig } from "@/types";
import { LucideIcon } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Stat {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

interface Chart {
  id: string;
  component: React.ElementType;
  props: any;
  card: {
    title: string;
    description: string;
    className?: string;
    contentClassName?: string;
  }
}

interface StaffDashboardProps {
  title: string;
  headerActions?: ReactNode;
  stats: Stat[];
  charts: Chart[];
  isAnalyticsLoading: boolean;
  dateRange: DateRange | undefined;
  onDateRangeChange: (date: DateRange | undefined) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (filter: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

const fetchTabCounts = async (role: string, dateRange?: DateRange) => {
    let query = supabase.from('bonafide_requests').select('status', { count: 'exact', head: true });
    if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
    }
    if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
    }

    const getCountForStatuses = (statuses: string[]) => {
        let statusQuery = query; // Important: create a new reference for each count
        return statusQuery.in('status', statuses).then(res => res.count || 0);
    }

    const actionableStatuses = {
        tutor: ['pending'],
        hod: ['approved_by_tutor'],
        admin: ['approved_by_hod'],
    }[role] || [];

    const [actionable, inProgress, completed, rejected, all] = await Promise.all([
        actionableStatuses.length > 0 ? getCountForStatuses(actionableStatuses) : Promise.resolve(0),
        getCountForStatuses(['pending', 'approved_by_tutor', 'approved_by_hod']),
        getCountForStatuses(['completed']),
        getCountForStatuses(['rejected_by_tutor', 'rejected_by_hod']),
        supabase.from('bonafide_requests').select('status', { count: 'exact', head: true }).gte('created_at', dateRange?.from?.toISOString() || '1970-01-01').lte('created_at', dateRange?.to?.toISOString() || new Date().toISOString()).then(res => res.count || 0)
    ]);

    return { actionable, inProgress, completed, rejected, all };
}

export const StaffDashboard = ({
  title,
  headerActions,
  stats,
  charts,
  isAnalyticsLoading,
  dateRange,
  onDateRangeChange,
  searchQuery,
  onSearchQueryChange,
  departmentFilter,
  onDepartmentFilterChange,
  activeTab,
  onTabChange,
  sortConfig,
  onSortChange,
}: StaffDashboardProps) => {
  const { profile } = useAuth();

  const { data: tabCounts } = useQuery({
    queryKey: ['tabCounts', profile?.role, dateRange],
    queryFn: () => fetchTabCounts(profile!.role, dateRange),
    enabled: !!profile,
  });

  const tabsInfo = useMemo(() => [
      { value: 'actionable', label: 'Action Required', count: tabCounts?.actionable ?? 0 },
      { value: 'inProgress', label: 'In Progress', count: tabCounts?.inProgress ?? 0 },
      { value: 'completed', label: 'Completed', count: tabCounts?.completed ?? 0 },
      { value: 'rejected', label: 'Rejected', count: tabCounts?.rejected ?? 0 },
      { value: 'all', label: 'All', count: tabCounts?.all ?? 0 },
    ], [tabCounts]);

  const handleClearFilters = () => {
    onDateRangeChange(undefined);
    onSearchQueryChange("");
    onDepartmentFilterChange("all");
    onTabChange("actionable");
  };

  if (isAnalyticsLoading) {
    return (
      <DashboardLayout title={title} headerActions={headerActions}>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={title} headerActions={headerActions}>
      <div className="space-y-8">
        <div className="flex justify-end">
          <DateRangePicker date={dateRange} setDate={onDateRangeChange} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
          ))}
        </div>
        
        {charts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {charts.map((chart) => (
              <Card key={chart.id} className={chart.card.className}>
                <CardHeader>
                  <CardTitle>{chart.card.title}</CardTitle>
                  <CardDescription>{chart.card.description}</CardDescription>
                </CardHeader>
                <CardContent className={chart.card.contentClassName}>
                  <chart.component {...chart.props} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <StaffRequestsManager 
          tabsInfo={tabsInfo}
          activeTab={activeTab}
          onTabChange={onTabChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchQueryChange}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={onDepartmentFilterChange}
          onClearFilters={handleClearFilters}
          sortConfig={sortConfig}
          onSortChange={onSortChange}
          dateRange={dateRange}
        />
      </div>
    </DashboardLayout>
  );
};