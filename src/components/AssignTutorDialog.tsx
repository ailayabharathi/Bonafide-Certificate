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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { ManagedUser } from "@/types";
import { useAssignTutorDialogLogic } from "@/hooks/useAssignTutorDialogLogic";
import { useState } from "react";

interface AssignTutorDialogProps {
  student: ManagedUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignTutorDialog({ student, isOpen, onOpenChange, onSuccess }: AssignTutorDialogProps) {
  const { tutors, isLoadingTutors, isAssigning, handleAssignTutor } = useAssignTutorDialogLogic({ student, onSuccess });
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(student?.tutor_id || null);

  const studentName = student ? `${student.first_name} ${student.last_name}` : "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Tutor to {studentName}</DialogTitle>
          <DialogDescription>
            Select a tutor from the list below to assign to this student.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoadingTutors ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedTutorId || ""}
              onValueChange={(value) => setSelectedTutorId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a tutor" />
              </SelectTrigger>
              <SelectContent>
                {tutors.map((tutor) => (
                  <SelectItem key={tutor.id} value={tutor.id}>
                    {tutor.first_name} {tutor.last_name} ({tutor.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isAssigning}>Cancel</Button>
          </DialogClose>
          <Button onClick={() => handleAssignTutor(selectedTutorId)} disabled={isAssigning || isLoadingTutors}>
            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}