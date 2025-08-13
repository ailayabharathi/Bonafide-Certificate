import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ManagedUser } from "@/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProfileForm } from "@/components/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const fetchUserById = async (userId: string): Promise<ManagedUser> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as ManagedUser;
};

const UserEditPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useQuery<ManagedUser>({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: !!userId,
  });

  const handleSuccess = () => {
    navigate("/admin/user-management");
  };

  const headerActions = (
    <Button asChild variant="outline">
      <Link to="/admin/user-management">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to User Management
      </Link>
    </Button>
  );

  return (
    <DashboardLayout title="Edit User" headerActions={headerActions}>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              {isLoading ? "Loading user..." : `Editing profile for ${user?.first_name} ${user?.last_name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : isError || !user ? (
              <div className="text-destructive">Failed to load user data.</div>
            ) : (
              <ProfileForm profileToEdit={user} onSuccess={handleSuccess} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserEditPage;