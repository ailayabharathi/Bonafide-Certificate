import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffDashboardLogic } from "@/hooks/useStaffDashboardLogic";

const TutorPortal = () => {
  const dashboardProps = useStaffDashboardLogic();

  return (
    <StaffDashboard
      title="Tutor Dashboard"
      {...dashboardProps}
    />
  );
};

export default TutorPortal;