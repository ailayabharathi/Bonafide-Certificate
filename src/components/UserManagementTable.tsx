import { useState, useMemo } from "react";
import { Profile, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { EditUserDialog } from "./EditUserDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { EditUserRoleDialog } from "./EditUserRoleDialog";
import { useUserManagementTableLogic } from "@/hooks/useUserManagementTableLogic";
import { getUserManagementTableColumns } from "@/lib/user-management-table-columns";
import { UserManagementContent } from "./UserManagementContent";
import { ManagedUser } from "@/types";

interface UserManagementTableProps {
  users: ManagedUser[];
  onUserUpdate: () => void;
  onResendInvite: (email: string, role: 'student' | 'tutor' | 'hod' | 'admin') => Promise<void>;
}

export function UserManagementTable({ users, onUserUpdate, onResendInvite }: UserManagementTableProps) {
  const { profile: currentUserProfile } = useAuth();
  const [userToEditProfile, setUserToEditProfile] = useState<ManagedUser | null>(null);
  const [userToEditRole, setUserToEditRole] = useState<ManagedUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
  
  const [isDeleting, setIsDeleting] = useState(false);

  const {
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
  } = useUserManagementTableLogic(users);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userIdToDelete: userToDelete.id },
      });

      if (error) throw new Error(error.message);

      showSuccess(`Successfully deleted user ${userToDelete.first_name} ${userToDelete.last_name}.`);
      onUserUpdate();
      setUserToDelete(null);
    } catch (error: any) {
      showError(error.message || "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(() => getUserManagementTableColumns({
    currentUserProfile,
    setUserToEditProfile,
    setUserToEditRole,
    setUserToDelete,
    onResendInvite,
  }), [currentUserProfile, onResendInvite]);

  return (
    <>
      <UserManagementContent
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        handleClearFilters={handleClearFilters}
        showClearFilters={showClearFilters}
        processedUsers={processedUsers}
        paginatedUsers={paginatedUsers}
        columns={columns}
        sortConfig={sortConfig as { key: string; direction: 'ascending' | 'descending' }}
        handleSort={handleSort}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      <DeleteUserDialog
        user={userToDelete}
        isOpen={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        isDeleting={isDeleting}
      />

      <EditUserDialog
        user={userToEditProfile}
        isOpen={!!userToEditProfile}
        onOpenChange={() => setUserToEditProfile(null)}
        onUserUpdate={() => {
          onUserUpdate();
          setUserToEditProfile(null);
        }}
      />

      <EditUserRoleDialog
        user={userToEditRole}
        isOpen={!!userToEditRole}
        onOpenChange={() => setUserToEditRole(null)}
        onRoleUpdated={() => {
          onUserUpdate();
          setUserToEditRole(null);
        }}
      />
    </>
  );
}