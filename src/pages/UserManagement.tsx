import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserNav } from "@/components/UserNav";
import { UserManagementTable } from "@/components/UserManagementTable";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/utils/toast";
import { Users } from "lucide-react";

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
               <img src="/placeholder.svg" alt="College Logo" className="h-8 w-8" />
              <span className="inline-block font-bold">ACE Portal</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <UserNav />
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
                <Users className="mr-3 h-8 w-8" />
                User Management
            </h1>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <UserManagementTable users={users} onUserUpdate={fetchUsers} />
        )}
      </main>
    </div>
  );
};

export default UserManagement;