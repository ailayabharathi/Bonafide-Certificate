import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Profile } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

type UserRole = 'student' | 'tutor' | 'hod' | 'admin';

interface EditRoleDialogProps {
  user: Profile | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newRole: UserRole) => void;
  isSubmitting: boolean;
}

export function EditRoleDialog({
  user,
  isOpen,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: EditRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  const handleConfirm = () => {
    if (selectedRole) {
      onConfirm(selectedRole);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-2">
            Editing role for: <span className="font-semibold">{user.first_name} {user.last_name}</span>
          </p>
          <Select value={selectedRole ?? undefined} onValueChange={(value: UserRole) => setSelectedRole(value)}>
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
            <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm} disabled={isSubmitting || !selectedRole}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}