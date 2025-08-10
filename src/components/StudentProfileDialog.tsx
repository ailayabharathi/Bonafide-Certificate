import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentProfileLogic } from "@/hooks/useStudentProfileLogic";

interface StudentProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function StudentProfileDialog({
  isOpen,
  onOpenChange,
  userId,
}: StudentProfileDialogProps) {
  const { profile, isLoading, isError, error, getInitials } = useStudentProfileLogic(userId, isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogDescription>View the complete profile details of the student.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex flex-col items-center space-y-4 py-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : isError ? (
          <div className="text-center py-4 text-destructive">
            Error loading profile: {error?.message || "Unknown error."}
          </div>
        ) : profile ? (
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} alt="Student avatar" />
                <AvatarFallback>{getInitials(profile.first_name, profile.last_name)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold mt-2">
                {profile.first_name} {profile.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="role">Role</Label>
              <p id="role" className="col-span-1 text-right capitalize">{profile.role}</p>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="registerNumber">Register Number</Label>
              <p id="registerNumber" className="col-span-1 text-right">{profile.register_number || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="department">Department</Label>
              <p id="department" className="col-span-1 text-right">{profile.department || 'N/A'}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Profile data not available.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}