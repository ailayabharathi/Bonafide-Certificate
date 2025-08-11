import { ReactNode, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StaffRequestsManager } from "@/components/StaffRequestsManager";
import { BonafideRequestWithProfile, BonafideStatus, SortConfig } from "@/types";
import { LucideIcon } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/contexts/AuthContext";

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
  allRequests: BonafideRequestWithProfile[];
  requests: BonafideRequestWithProfile[];
  isLoading: boolean;
  onAction: (requestId: string, newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
  onBulkAction: (requestIds: string[], newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
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

export const StaffDashboard = ({
  title,
  headerActions,
  stats,
  charts,
  allRequests,
  requests,
  isLoading,
  onAction,
  onBulkAction,
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

  const tabsInfo = useMemo(() => {
    if (!profile) return [];
    
    const filteredByDate = dateRange?.from 
      ? allRequests.filter(r => new Date(r.created_at) >= dateRange.from! && new Date(r.created_at) <= (dateRange.to || new Date()))
      : allRequests;

    const getCount = (status: BonafideStatus | 'actionable' | 'inProgress' | 'rejected' | 'all') => {
      if (status === 'all') return filteredByDate.length;
      if (status === 'inProgress') return filteredByDate.filter(r => ['pending', 'approved_by_tutor', 'approved_by_hod'].includes(r.status)).length;
      if (status === 'rejected') return filteredByDate.filter(r => ['rejected_by_tutor', 'rejected_by_hod'].includes(r.status)).length;
      if (status === 'actionable') {
        if (profile.role === 'tutor') return filteredByDate.filter(r => r.status === 'pending').length;
        if (profile.role === 'hod') return filteredByDate.filter(r => r.status === 'approved_by_tutor').length;
        if (profile.role === 'admin') return filteredByDate.filter(r => r.status === 'approved_by_hod').length;
        return 0;
      }
      return filteredByDate.filter(r => r.status === status).length;
    };

    return [
      { value: 'actionable', label: 'Action Required', count: getCount('actionable') },
      { value: 'inProgress', label: 'In Progress', count: getCount('inProgress') },
      { value: 'completed', label: 'Completed', count: getCount('completed') },
      { value: 'rejected', label: 'Rejected', count: getCount('rejected') },
      { value: 'all', label: 'All', count: getCount('all') },
    ];
  }, [allRequests, profile, dateRange]);

  const handleClearFilters = () => {
    onDateRangeChange(undefined);
    onSearchQueryChange("");
    onDepartmentFilterChange("all");
    onTabChange("actionable");
  };

  if (isLoading && allRequests.length === 0) {
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
          requests={requests} 
          onAction={onAction} 
          onBulkAction={onBulkAction}
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
        />
      </div>
    </DashboardLayout>
  );
};