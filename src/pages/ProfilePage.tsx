import { useLocation, useNavigate } from "react-router-dom";
import { ProfileForm } from "@/components/ProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const ProfilePage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

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
          {message && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}
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