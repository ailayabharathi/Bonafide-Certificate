import { useMemo } from "react";
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
import { ColumnDef, ManagedUser } from "@/types";
import { departments } from "@/lib/departments";

type UserRole = 'student' | 'tutor' | 'hod' | 'admin';

interface UserManagementContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string;
  setRoleFilter: (role: 'all' | UserRole) => void;
  departmentFilter: string;
  setDepartmentFilter: (department: string) => void;
  handleClearFilters: () => void;
  showClearFilters: boolean;
  processedUsers: ManagedUser[];
  paginatedUsers: ManagedUser[];
  columns: ColumnDef<ManagedUser>[];
  sortConfig: { key: string; direction: 'ascending' | 'descending' };
  handleSort: (key: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}

export function UserManagementContent({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  departmentFilter,
  setDepartmentFilter,
  handleClearFilters,
  showClearFilters,
  processedUsers,
  paginatedUsers,
  columns,
  sortConfig,
  handleSort,
  currentPage,
  setCurrentPage,
  totalPages,
}: UserManagementContentProps) {
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
    </>
  );
}