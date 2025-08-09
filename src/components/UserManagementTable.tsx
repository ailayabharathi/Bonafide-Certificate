import { useState, useMemo } from "react";
import { Profile, useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Pencil, ArrowUpDown, ArrowUp, ArrowDown, UserCog, Trash2, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditUserDialog } from "./EditUserDialog";
import { DeleteUserDialog } => "./DeleteUserDialog";
import { ExportButton } from "./ExportButton"; // Import ExportButton
import { departments } from "@/lib/departments"; // Import the departments list
import { EditUserRoleDialog } from "./EditUserRoleDialog"; // Import the new dialog
import { DataTable } from "./DataTable"; // Import DataTable
import { useUserManagementTableLogic } from "@/hooks/useUserManagementTableLogic"; // Import the new hook
import { getUserManagementTableColumns } from "@/lib/user-management-table-columns"; // Import the new utility

interface UserManagementTableProps {
  users: Profile[];
  onUserUpdate: () => void;
  roleFilter: 'all' | 'student' | 'tutor' | 'hod' | 'admin';
  onRoleFilterChange: (value: 'all' | 'student' | 'tutor' | 'hod' | 'admin') => void;
}

type UserRole = 'student' | 'tutor' | 'hod' | 'admin';
type SortableKey = 'name' | 'email' | 'role' | 'department' | 'register_number';

export function UserManagementTable({ users, onUserUpdate, roleFilter, onRoleFilterChange }: UserManagementTableProps) {
  const { user: currentUser, profile: currentUserProfile } = useAuth();
  const [userToEditProfile, setUserToEditProfile] = useState<Profile | null>(null);
  const [userToEditRole, setUserToEditRole] = useState<Profile | null>(null); // New state for role editing
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    searchQuery,
    setSearchQuery,
    roleFilter: internalRoleFilter, // Renamed to avoid conflict with prop
    setRoleFilter: setInternalRoleFilter, // Renamed to avoid conflict with prop
    departmentFilter,
    setDepartmentFilter,
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    handleClearFilters,
    processedUsers,
    totalPages,
    paginatedUsers,
    showClearFilters,
    ITEMS_PER_PAGE,
  } = useUserManagementTableLogic(users);

  // Sync external roleFilter prop with internal state
  useMemo(() => {
    setInternalRoleFilter(roleFilter);
  }, [roleFilter, setInternalRoleFilter]);

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
    currentUser,
    currentUserProfile,
    setUserToEditProfile,
    setUserToEditRole,
    setUserToDelete,
  }), [currentUser, currentUserProfile, setUserToEditProfile, setUserToEditRole, setUserToDelete]);

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <Input
          placeholder="Search by name, email, department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={internalRoleFilter} onValueChange={(value: UserRole | "all") => {
          setInternalRoleFilter(value);
          onRoleFilterChange(value); // Propagate change to parent
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="tutor">Tutor</SelectItem>
            <SelectItem value="hod">HOD</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ExportButton 
          data={processedUsers}
          filename={`user-management-${new Date().toISOString().split('T')[0]}.csv`}
        />
        {showClearFilters && (
          <Button variant="outline" onClick={handleClearFilters}>
            <XCircle className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
      <div className="border rounded-md">
        <DataTable
          columns={columns}
          data={paginatedUsers}
          sortConfig={sortConfig as { key: string; direction: 'ascending' | 'descending' }}
          onSort={handleSort}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          rowKey={(row) => row.id}
        />
      </div>

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