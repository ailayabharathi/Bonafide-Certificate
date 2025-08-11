import { useState, useMemo } from "react";
import { Profile, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { EditUserRoleDialog } from "./EditUserRoleDialog";
import { useUserManagementTableLogic } from "@/hooks/useUserManagementTableLogic";
import { getUserManagementTableColumns } from "@/lib/user-management-table-columns";
import { UserManagementContent } from "./UserManagementContent";
import { ManagedUser } from "@/types";

interface UserManagementTableProps {
  users: ManagedUser[];
  onUserUpdate: () => void;
}

export function UserManagementTable({ users, onUserUpdate }: UserManagementTableProps) {
  const { profile: currentUserProfile } = useAuth();
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

      showSuccess(`Successfully deleted user ${userToDelete.first_name || userToDelete.email}.`);
      onUserUpdate();
      setUserToDelete(null);
    } catch (error: any) {
      showError(error.message || "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResendInvite = async (email: string) => {
    try {
      const { error } = await supabase.functions.invoke('resend-invite', {
        body: { email },
      });
      if (error) throw error;
      showSuccess(`Invitation resent to ${email}.`);
      onUserUpdate(); // Refresh the list to update the 'invited_at' timestamp
    } catch (error: any) {
      showError(error.message || "Failed to resend invitation.");
    }
  };

  const columns = useMemo(() => getUserManagementTableColumns({
    currentUserProfile,
    setUserToEditRole,
    setUserToDelete,
    onResendInvite: handleResendInvite,
  }), [currentUserProfile]);

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