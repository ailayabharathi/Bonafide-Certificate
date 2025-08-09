import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Profile } from "@/contexts/AuthContext";
import { ProfileForm } from "./ProfileForm";

interface EditUserDialogProps {
  user: Profile | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: () => void;
}

export function EditUserDialog({ user, isOpen, onOpenChange, onUserUpdate }: EditUserDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Modify the details for {user.first_name} {user.last_name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ProfileForm profileToEdit={user} onSuccess={() => {
            onUserUpdate();
            onOpenChange(false);
          }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}