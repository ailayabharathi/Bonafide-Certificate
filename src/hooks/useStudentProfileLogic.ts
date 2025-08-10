import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Profile } from "@/contexts/AuthContext";

const fetchProfileById = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    showError("Failed to fetch student profile.");
    throw new Error(error.message);
  }
  return data as Profile;
};

export const useStudentProfileLogic = (userId: string | null, isOpen: boolean) => {
  const { data: profile, isLoading, isError, error } = useQuery<Profile | null>({
    queryKey: ['studentProfile', userId],
    queryFn: () => (userId ? fetchProfileById(userId) : Promise.resolve(null)),
    enabled: isOpen && !!userId,
  });

  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  return {
    profile,
    isLoading,
    isError,
    error,
    getInitials,
  };
};