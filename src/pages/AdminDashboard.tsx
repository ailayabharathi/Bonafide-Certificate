import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffPortal } from "@/hooks/useStaffPortal";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const staffPortalProps = useStaffPortal();
  const { profile } = useAuth();
  const { stats, charts, isLoading } = useDashboardAnalytics(profile, staffPortalProps.dateRange);

  const headerActions = (
    <Link to="/admin/user-management">
      <Button variant="outline">
        <Users className="mr-2 h-4 w-4" />
        Manage Users
      </Button>
    </Link>
  );

  return (
    <StaffDashboard
      title="Admin Dashboard"
      headerActions={headerActions}
      stats={stats}
      charts={charts}
      isAnalyticsLoading={isLoading}
      {...staffPortalProps}
    />
  );
};

export default AdminDashboard;