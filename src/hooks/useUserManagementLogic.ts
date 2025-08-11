import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ManagedUser } from "@/types";
import { showError } from "@/utils/toast";

const fetchAllUsers = async (): Promise<ManagedUser[]> => {
  // The get-users function is causing deployment issues.
  // This is disabled until the underlying configuration issue is resolved.
  console.error("User management is temporarily disabled due to a configuration issue.");
  return [];
};

export const useUserManagementLogic = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      showError(error.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    fetchUsers,
  };
};