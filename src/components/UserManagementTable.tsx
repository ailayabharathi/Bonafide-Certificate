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
import { DeleteUserDialog } from "./DeleteUserDialog";
import { ExportButton } from "./ExportButton"; // Import ExportButton
import { departments } from "@/lib/departments"; // Import the departments list
import { EditUserRoleDialog } from "./EditUserRoleDialog"; // Import the new dialog
import { DataTable } from "./DataTable"; // Import DataTable

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
  
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all"); // New state for department filter
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  const ITEMS_PER_PAGE = 10;

  const handleSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

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

  const handleClearFilters = () => {
    setSearchQuery("");
    onRoleFilterChange("all");
    setDepartmentFilter("all"); // Clear department filter
    setCurrentPage(1);
  };

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
      .filter(user => {
        if (roleFilter === "all") return true;
        return user.role === roleFilter;
      })
      .filter(user => { // Apply new department filter
        if (departmentFilter === "all") return true;
        return user.department === departmentFilter;
      });

    filteredUsers.sort((a, b) => {
      let aValue: string, bValue: string;
      switch (sortConfig.key) {
        case 'name':
          aValue = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
          bValue = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'role':
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case 'department':
            aValue = a.department?.toLowerCase() || '';
            bValue = b.department?.toLowerCase() || '';
            break;
        case 'register_number':
            aValue = a.register_number?.toLowerCase() || '';
            bValue = b.register_number?.toLowerCase() || '';
            break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

    return filteredUsers;
  }, [users, searchQuery, roleFilter, departmentFilter, sortConfig]);

  const totalPages = Math.ceil(processedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = processedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const showClearFilters = searchQuery !== "" || roleFilter !== "all" || departmentFilter !== "all";

  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }: { row: Profile }) => `${row.first_name} ${row.last_name}`,
      enableSorting: true,
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }: { row: Profile }) => row.email,
      enableSorting: true,
    },
    {
      id: 'register_number',
      header: 'Register No.',
      cell: ({ row }: { row: Profile }) => row.register_number || 'N/A',
      enableSorting: true,
    },
    {
      id: 'department',
      header: 'Department',
      cell: ({ row }: { row: Profile }) => row.department || 'N/A',
      enableSorting: true,
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }: { row: Profile }) => <span className="capitalize">{row.role}</span>,
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Profile }) => {
        const isCurrentUser = row.id === currentUser?.id;
        return (
          <div className="flex gap-1 justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setUserToEditProfile(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Edit Profile</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUserToEditRole(row)}
                      disabled={isCurrentUser || currentUserProfile?.role !== 'admin'}
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {isCurrentUser ? <p>You cannot edit your own role.</p> : currentUserProfile?.role !== 'admin' ? <p>Only administrators can edit roles.</p> : <p>Edit Role</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUserToDelete(row)}
                      disabled={isCurrentUser || currentUserProfile?.role !== 'admin'}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {isCurrentUser ? <p>You cannot delete yourself.</p> : currentUserProfile?.role !== 'admin' ? <p>Only administrators can delete users.</p> : <p>Delete User</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      className: "text-right",
    },
  ], [currentUser, currentUserProfile]);

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <Input
          placeholder="Search by name, email, department..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={(value: UserRole | "all") => {
          onRoleFilterChange(value);
          setCurrentPage(1);
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
        <Select value={departmentFilter} onValueChange={(value) => {
          setDepartmentFilter(value);
          setCurrentPage(1);
        }}>
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