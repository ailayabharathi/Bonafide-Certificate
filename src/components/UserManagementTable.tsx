import { useState, useMemo } from "react";
import { Profile } from "@/contexts/AuthContext";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Pencil } from "lucide-react";

interface UserManagementTableProps {
  users: Profile[];
  onUserUpdate: () => void;
}

type UserRole = 'student' | 'tutor' | 'hod' | 'admin';

export function UserManagementTable({ users, onUserUpdate }: UserManagementTableProps) {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const openDialog = (user: Profile) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setNewRole(null);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", selectedUser.id);

      if (error) throw error;

      showSuccess(`Successfully updated ${selectedUser.first_name}'s role to ${newRole}.`);
      onUserUpdate();
      closeDialog();
    } catch (error: any) {
      showError(error.message || "Failed to update user role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const name = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
      })
      .filter(user => {
        if (roleFilter === "all") return true;
        return user.role === roleFilter;
      });
  }, [users, searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <div className="p-4 border rounded-md bg-background">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
          <Select value={roleFilter} onValueChange={(value: UserRole | "all") => {
            setRoleFilter(value);
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
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openDialog(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
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
      </div>

      <Dialog open={!!selectedUser} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">
              Editing role for: <span className="font-semibold">{selectedUser?.first_name} {selectedUser?.last_name}</span>
            </p>
            <Select value={newRole ?? undefined} onValueChange={(value: UserRole) => setNewRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="tutor">Tutor</SelectItem>
                <SelectItem value="hod">HOD</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateRole} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}