import { useLocation, useNavigate } from "react-router-dom";
import { ProfileForm } from "@/components/ProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { UpdateAuthForm } from "@/components/UpdateAuthForm"; // Import the new component

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
      <div className="max-w-2xl mx-auto space-y-6">
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
                  <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ProfileForm onSuccess={handleSuccess} />
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Change your email address or password.</CardDescription>
              </CardHeader>
              <CardContent>
                  <UpdateAuthForm />
              </CardContent>
          </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;