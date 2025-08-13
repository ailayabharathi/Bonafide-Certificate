import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { EditUserRoleDialog } from "./EditUserRoleDialog";
import { AssignTutorDialog } from "./AssignTutorDialog";
import { getUserManagementTableColumns } from "@/lib/user-management-table-columns";
import { ManagedUser, SortConfig } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { ExportButton } from "./ExportButton";
import { DataTable } from "./DataTable";
import { departments } from "@/lib/departments";

type UserRole = 'student' | 'tutor' | 'hod' | 'admin';

interface UserManagementTableProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: 'all' | UserRole;
  setRoleFilter: (role: 'all' | UserRole) => void;
  departmentFilter: string;
  setDepartmentFilter: (department: string) => void;
  handleClearFilters: () => void;
  showClearFilters: boolean;
  paginatedUsers: ManagedUser[];
  sortConfig: SortConfig;
  handleSort: (key: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  userToEditRole: ManagedUser | null;
  setUserToEditRole: (user: ManagedUser | null) => void;
  userToDelete: ManagedUser | null;
  setUserToDelete: (user: ManagedUser | null) => void;
  isDeleting: boolean;
  handleDeleteUser: () => void;
  handleRoleUpdated: () => void;
  isExporting: boolean;
  handleExport: () => void;
  userToAssignTutor: ManagedUser | null;
  setUserToAssignTutor: (user: ManagedUser | null) => void;
  handleAssignTutorSuccess: () => void;
  isLoading: boolean;
}

export function UserManagementTable({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  departmentFilter,
  setDepartmentFilter,
  handleClearFilters,
  showClearFilters,
  paginatedUsers,
  sortConfig,
  handleSort,
  currentPage,
  setCurrentPage,
  totalPages,
  userToEditRole,
  setUserToEditRole,
  userToDelete,
  setUserToDelete,
  isDeleting,
  handleDeleteUser,
  handleRoleUpdated,
  isExporting,
  handleExport,
  userToAssignTutor,
  setUserToAssignTutor,
  handleAssignTutorSuccess,
  isLoading,
}: UserManagementTableProps) {
  const { profile: currentUserProfile } = useAuth();

  const columns = useMemo(() => getUserManagementTableColumns({
    currentUserProfile,
    setUserToEditRole,
    setUserToDelete,
    onAssignTutor: setUserToAssignTutor,
  }), [currentUserProfile, setUserToEditRole, setUserToDelete, setUserToAssignTutor]);

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <Input
          placeholder="Search by name, email, department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as 'all' | UserRole)}>
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
          onExport={handleExport}
          isExporting={isExporting}
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
          sortConfig={sortConfig}
          onSort={handleSort}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          rowKey={(row) => row.id}
          isLoading={isLoading}
        />
      </div>

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
        onRoleUpdated={handleRoleUpdated}
      />

      <AssignTutorDialog
        student={userToAssignTutor}
        isOpen={!!userToAssignTutor}
        onOpenChange={() => setUserToAssignTutor(null)}
        onSuccess={handleAssignTutorSuccess}
      />
    </>
  );
}