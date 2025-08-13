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
import { RequestActionDialog } from "./RequestActionDialog";
import { StudentProfileDialog } from "./StudentProfileDialog";
import { useAuth } from "@/contexts/AuthContext";
import { BonafideRequestWithProfile } from "@/types";

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
  isLoading: boolean;
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
  handleClearFilters: () => void;
  requests: BonafideRequestWithProfile[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  selectableRowIds: string[];
  openActionDialog: (type: 'approve' | 'reject' | 'revert', bulk: boolean, request?: BonafideRequestWithProfile) => void;
  handleViewProfile: (userId: string) => void;
  isExporting: boolean;
  handleExport: () => void;
  tabsInfo: { value: string; label: string; count: number }[];
  actionRequest: BonafideRequestWithProfile | null;
  actionType: 'approve' | 'reject' | 'revert' | null;
  isBulk: boolean;
  isMutating: boolean;
  closeActionDialog: () => void;
  handleConfirmAction: (reason?: string) => void;
  isProfileDialogOpen: boolean;
  setIsProfileDialogOpen: (open: boolean) => void;
  studentUserIdToView: string | null;
}

export const StaffDashboard = ({
  title,
  headerActions,
  stats,
  charts,
  isLoading,
  dateRange,
  onDateRangeChange,
  // Pass all other props down to StaffRequestsManager
  ...managerProps
}: StaffDashboardProps) => {
  const { profile } = useAuth();

  if (isLoading && managerProps.requests.length === 0) {
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
    <>
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

          <StaffRequestsManager {...managerProps} />
        </div>
      </DashboardLayout>

      <RequestActionDialog
        isOpen={!!managerProps.actionType}
        onOpenChange={(open) => !open && managerProps.closeActionDialog()}
        actionType={managerProps.actionType}
        isBulk={managerProps.isBulk}
        request={managerProps.actionRequest}
        selectedIdsCount={managerProps.selectedIds.length}
        onConfirm={managerProps.handleConfirmAction}
        isSubmitting={managerProps.isMutating}
        profile={profile}
      />

      <StudentProfileDialog
        isOpen={managerProps.isProfileDialogOpen}
        onOpenChange={managerProps.setIsProfileDialogOpen}
        userId={managerProps.studentUserIdToView}
      />
    </>
  );
};