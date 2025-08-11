import { useState, useMemo } from "react";
import { Profile, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
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
      const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);
      if (error) throw error;
      
      showSuccess(`User ${userToDelete.email} has been deleted.`);
      onUserUpdate();
      setUserToDelete(null);
    } catch (error: any) {
      showError(error.message || "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResendInvite = async (email: string) => {
    if (!email) return;
    const toastId = showLoading("Resending invitation...");
    try {
      const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      dismissToast(toastId);
      showSuccess(`Invitation resent to ${email}.`);
    } catch (error: any) {
      dismissToast(toastId);
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