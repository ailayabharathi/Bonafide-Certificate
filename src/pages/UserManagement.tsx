import { useEffect, useState } from "react";
import { UserManagementTable } from "@/components/UserManagementTable";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/utils/toast";
import { DashboardLayout } from "@/components/DashboardLayout";

const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout title="User Management">
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
  );
};

export default UserManagement;