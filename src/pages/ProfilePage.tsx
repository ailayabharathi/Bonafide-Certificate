import { useNavigate } from "react-router-dom";
import { ProfileForm } from "@/components/ProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";

const ProfilePage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    if (profile) {
      navigate(`/${profile.role}/dashboard`);
    } else {
      navigate('/');
    }
  };

  return (
    <DashboardLayout title="Your Profile">
      <div className="max-w-2xl mx-auto">
          <Card>
              <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                  <ProfileForm onSuccess={handleSuccess} />
              </CardContent>
          </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;