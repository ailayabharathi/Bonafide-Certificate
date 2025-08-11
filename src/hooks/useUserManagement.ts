import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ManagedUser, SortConfig } from "@/types";
import { showError, showSuccess } from "@/utils/toast";

type UserRole = 'student' | 'tutor' | 'hod' | 'admin';
type SortableKey = 'name' | 'email' | 'role' | 'department' | 'register_number' | 'created_at';
const ITEMS_PER_PAGE = 10;

const fetchAllUsers = async (): Promise<ManagedUser[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, first_name, last_name, avatar_url, department, register_number, created_at');
  
  if (error) {
    throw new Error(error.message);
  }
  return data as ManagedUser[];
};

export const useUserManagement = () => {
  // Data and loading state
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch users logic
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data || []);
    } catch (error: any) {
      showError(error.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, departmentFilter, sortConfig]);

  // Memoized processing of users
  const processedUsers = useMemo(() => {
    let filteredUsers = users
      .filter(user => {
        const name = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const email = user.email?.toLowerCase() || '';
        const department = user.department?.toLowerCase() || '';
        const registerNumber = user.register_number?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return name.includes(query) || email.includes(query) || department.includes(query) || registerNumber.includes(query);
      })
      .filter(user => roleFilter === "all" || user.role === roleFilter)
      .filter(user => departmentFilter === "all" || user.department === departmentFilter);

    filteredUsers.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      switch (sortConfig.key as SortableKey) {
        case 'name':
          aValue = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
          bValue = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
          break;
        case 'created_at':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
        default:
          aValue = (a[sortConfig.key as keyof ManagedUser] as string)?.toLowerCase() || '';
          bValue = (b[sortConfig.key as keyof ManagedUser] as string)?.toLowerCase() || '';
          break;
      }

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

    return filteredUsers;
  }, [users, searchQuery, roleFilter, departmentFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = processedUsers.slice(
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
      fetchUsers(); // Refresh user list
      setUserToDelete(null);
    } catch (error: any) {
      showError(error.message || "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRoleUpdated = () => {
    fetchUsers();
    setUserToEditRole(null);
  };

  const showClearFilters = searchQuery !== "" || roleFilter !== "all" || departmentFilter !== "all";

  return {
    loading,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    fetchUsers,
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
    processedUsers,
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