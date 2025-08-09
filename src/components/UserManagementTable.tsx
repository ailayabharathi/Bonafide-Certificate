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

interface UserManagementTableProps {
  users: Profile[];
  onUserUpdate: () => void;
  roleFilter: 'all' | 'student' | 'tutor' | 'hod' | 'admin';
  onRoleFilterChange: (value: 'all' | 'student' | 'tutor' | 'hod' | 'admin') => void;
}

type UserRole = 'student' | 'tutor' | 'hod' | 'admin';
type SortableKey = 'name' | 'email' | 'role' | 'department' | 'register_number';

export function UserManagementTable({ users, onUserUpdate, roleFilter, onRoleFilterChange }: UserManagementTableProps) {
  const { user: currentUser } = useAuth();
  const [userToEditProfile, setUserToEditProfile] = useState<Profile | null>(null);
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

  // Removed uniqueDepartments memo as we will use the imported 'departments' list

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

  const SortableHeader = ({ columnKey, title }: { columnKey: SortableKey, title: string }) => {
    const isSorted = sortConfig.key === columnKey;
    return (
      <TableHead>
        <Button variant="ghost" onClick={() => handleSort(columnKey)}>
          {title}
          {isSorted ? (
            sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />
          )}
        </Button>
      </TableHead>
    );
  };

  const showClearFilters = searchQuery !== "" || roleFilter !== "all" || departmentFilter !== "all";

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
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader columnKey="name" title="Name" />
              <SortableHeader columnKey="email" title="Email" />
              <SortableHeader columnKey="register_number" title="Register No." />
              <SortableHeader columnKey="department" title="Department" />
              <SortableHeader columnKey="role" title="Role" />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.register_number}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setUserToEditProfile(user)}>
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
                                  onClick={() => setUserToEditProfile(user)} // Now opens EditUserDialog
                                  disabled={isCurrentUser}
                                >
                                  <UserCog className="h-4 w-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isCurrentUser ? <p>You cannot edit your own role.</p> : <p>Edit Role</p>}
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
                                  onClick={() => setUserToDelete(user)}
                                  disabled={isCurrentUser}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isCurrentUser ? <p>You cannot delete yourself.</p> : <p>Delete User</p>}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 pt-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages || 1}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
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
    </>
  );
}