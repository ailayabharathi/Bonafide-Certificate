import { ReactNode } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StaffRequestsTable } from "@/components/StaffRequestsTable";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { LucideIcon } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import { DateRange } from "react-day-picker";

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
  requests: BonafideRequestWithProfile[];
  isLoading: boolean;
  onAction: (requestId: string, newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
  onBulkAction: (requestIds: string[], newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
  dateRange: DateRange | undefined;
  onDateRangeChange: (date: DateRange | undefined) => void;
}

export const StaffDashboard = ({
  title,
  headerActions,
  stats,
  charts,
  requests,
  isLoading,
  onAction,
  onBulkAction,
  dateRange,
  onDateRangeChange,
}: StaffDashboardProps) => {
  if (isLoading) {
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

        <StaffRequestsTable requests={requests} onAction={onAction} onBulkAction={onBulkAction} />
      </div>
    </DashboardLayout>
  );
};