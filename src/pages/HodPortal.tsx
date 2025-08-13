import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffPortal } from "@/hooks/useStaffPortal";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useAuth } from "@/contexts/AuthContext";

const HodPortal = () => {
  const staffPortalProps = useStaffPortal();
  const { profile } = useAuth();
  const { stats, charts, isLoading } = useDashboardAnalytics(profile, staffPortalProps.dateRange);

  return (
    <StaffDashboard
      title="HOD Dashboard"
      stats={stats}
      charts={charts}
      isAnalyticsLoading={isLoading}
      {...staffPortalProps}
    />
  );
};

export default HodPortal;