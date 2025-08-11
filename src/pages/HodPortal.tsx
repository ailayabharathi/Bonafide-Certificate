import { StaffDashboard } from "@/components/StaffDashboard";
import { useStaffPortal } from "@/hooks/useStaffPortal";

const HodPortal = () => {
  const staffPortalProps = useStaffPortal('hod');

  return (
    <StaffDashboard
      title="HOD Dashboard"
      {...staffPortalProps}
    />
  );
};

export default HodPortal;