import { useEffect, useState } from "react";
import { UserManagementTable } from "@/components/UserManagementTable";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/utils/toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { InviteUserDialog } from "@/components/InviteUserDialog";

const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showError("Failed to fetch users. Ensure you have the correct permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const headerActions = (
    <Button onClick={() => setIsInviteDialogOpen(true)}>
      <UserPlus className="mr-2 h-4 w-4" />
      Invite User
    </Button>
  );

  return (
    <>
      <DashboardLayout title="User Management" headerActions={headerActions}>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <UserManagementTable users={users} onUserUpdate={fetchUsers} />
        )}
      </DashboardLayout>
      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onInviteSent={fetchUsers}
      />
    </>
  );
};

export default UserManagement;