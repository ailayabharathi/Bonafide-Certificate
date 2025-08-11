import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffPortal } from "@/hooks/useStaffPortal";

const TutorPortal = () => {
  const staffPortalProps = useStaffPortal('tutor');

  return (
    <StaffDashboard
      title="Tutor Dashboard"
      {...staffPortalProps}
    />
  );
};

export default TutorPortal;