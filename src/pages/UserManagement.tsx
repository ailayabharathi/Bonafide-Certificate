import { UserManagementTable } from "@/components/UserManagementTable";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { InviteUserDialog } from "@/components/InviteUserDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUserManagement } from "@/hooks/useUserManagement";

const UserManagement = () => {
  const {
    loading,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    handleInviteSent,
    ...tableProps
  } = useUserManagement();

  return (
    <>
      <DashboardLayout title="User Management">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Invite new users and manage existing user roles.
              </CardDescription>
            </div>
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </CardHeader>
          <CardContent>
            {loading && tableProps.paginatedUsers.length === 0 ? (
              <div className="space-y-2 pt-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <UserManagementTable {...tableProps} />
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onInviteSent={handleInviteSent}
      />
    </>
  );
};

export default UserManagement;