import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffDashboardLogic } from "@/hooks/useStaffDashboardLogic";

const HodPortal = () => {
  const dashboardProps = useStaffDashboardLogic();

  return (
    <StaffDashboard
      title="HOD Dashboard"
      {...dashboardProps}
    />
  );
};

export default HodPortal;