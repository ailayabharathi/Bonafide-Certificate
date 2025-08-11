import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ManagedUser, SortConfig } from "@/types";
import { showError, showSuccess } from "@/utils/toast";

type UserRole = 'student' | 'tutor' | 'hod' | 'admin';
const ITEMS_PER_PAGE = 10;

const fetchUsers = async (params: {
  searchQuery: string;
  roleFilter: UserRole | 'all';
  departmentFilter: string;
  sortConfig: SortConfig;
}): Promise<ManagedUser[]> => {
  const { searchQuery, roleFilter, departmentFilter, sortConfig } = params;

  let query = supabase
    .from('profiles')
    .select('id, email, role, first_name, last_name, avatar_url, department, register_number, created_at');

  if (searchQuery) {
    const searchPattern = `%${searchQuery}%`;
    query = query.or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern},register_number.ilike.${searchPattern}`);
  }

  if (roleFilter !== 'all') {
    query = query.eq('role', roleFilter);
  }

  if (departmentFilter !== 'all') {
    query = query.eq('department', departmentFilter);
  }

  const sortKey = sortConfig.key === 'name' ? 'first_name' : sortConfig.key;
  query = query.order(sortKey, { ascending: sortConfig.direction === 'ascending' });
  if (sortConfig.key === 'name') {
    query = query.order('last_name', { ascending: sortConfig.direction === 'ascending' });
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data as ManagedUser[];
};

export const useUserManagement = () => {
  const queryClient = useQueryClient();

  // Dialog states
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [userToEditRole, setUserToEditRole] = useState<ManagedUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtering and sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });

  // Data fetching with react-query
  const queryKey = ['users', searchQuery, roleFilter, departmentFilter, sortConfig];
  const { data: users = [], isLoading: loading } = useQuery<ManagedUser[]>({
    queryKey,
    queryFn: () => fetchUsers({ searchQuery, roleFilter, departmentFilter, sortConfig }),
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, departmentFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Action handlers
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setDepartmentFilter("all");
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);
      if (error) throw error;
      showSuccess(`User ${userToDelete.email} has been deleted.`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setUserToDelete(null);
    } catch (error: any) {
      showError(error.message || "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRoleUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    setUserToEditRole(null);
  };
  
  const handleInviteSent = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const showClearFilters = searchQuery !== "" || roleFilter !== "all" || departmentFilter !== "all";

  return {
    loading,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    handleInviteSent,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    departmentFilter,
    setDepartmentFilter,
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    processedUsers: users, // For export
    totalPages,
    paginatedUsers,
    handleClearFilters,
    showClearFilters,
    userToEditRole,
    setUserToEditRole,
    userToDelete,
    setUserToDelete,
    isDeleting,
    handleDeleteUser,
    handleRoleUpdated,
  };
};