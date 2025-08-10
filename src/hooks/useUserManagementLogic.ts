import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ManagedUser } from "@/types";
import { showError, showSuccess } from "@/utils/toast";

export const useUserManagementLogic = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-all-users');

      if (error) throw error;
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

  const resendInvite = useCallback(async (email: string, role: 'student' | 'tutor' | 'hod' | 'admin') => {
    try {
      const { error } = await supabase.functions.invoke('invite-user', {
        body: { email, role },
      });
      if (error) throw error;
      showSuccess(`Invitation resent to ${email}.`);
    } catch (error: any) {
      showError(error.message || `Failed to resend invitation to ${email}.`);
    }
  }, []);

  return {
    users,
    loading,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    fetchUsers,
    resendInvite,
  };
};