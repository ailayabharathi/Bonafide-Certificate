import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ManagedUser } from "@/types";
import { showError } from "@/utils/toast";

// This will now fetch from the 'profiles' table, so it will only return users who have completed sign-up.
const fetchUsersFromProfiles = async (): Promise<ManagedUser[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        throw error;
    }
    // The data from profiles table should match the ManagedUser type for the most part.
    return data as ManagedUser[];
};


export const useUserManagementLogic = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsersFromProfiles();
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

  // The resendInvite functionality is removed as we can't see invited users anymore.
  // The function to invite new users will still work.

  return {
    users,
    loading,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    fetchUsers,
  };
};