import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ManagedUser } from "@/types";
import { showError } from "@/utils/toast";

const fetchAllUsers = async (): Promise<ManagedUser[]> => {
  // This is a fallback since the 'get-users' function is unavailable.
  // It will not include auth data like last_sign_in_at or invited_at.
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) {
    throw new Error(error.message);
  }
  // The data from 'profiles' table matches most of the ManagedUser type.
  // The missing fields will be undefined, which is acceptable.
  return data as ManagedUser[];
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