import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffPortal } from "@/hooks/useStaffPortal";

const AdminDashboard = () => {
  const staffPortalProps = useStaffPortal('admin');

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
      {...staffPortalProps}
    />
  );
};

export default AdminDashboard;