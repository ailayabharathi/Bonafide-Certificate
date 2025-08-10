import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { ManagedUser } from "@/types";
import { ReadOnlyRequestsTable } from "./ReadOnlyRequestsTable";

interface TuteeRequestsDialogProps {
  tutee: ManagedUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TuteeRequestsDialog = ({ tutee, isOpen, onOpenChange }: TuteeRequestsDialogProps) => {
  const { requests, isLoading } = useBonafideRequests(
    `tutee-requests:${tutee?.id}`,
    tutee?.id,
    undefined,
    undefined,
    undefined,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request History for {tutee?.first_name} {tutee?.last_name}</DialogTitle>
          <DialogDescription>
            Here is a list of all bonafide certificate requests submitted by this student.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="border rounded-md">
              <ReadOnlyRequestsTable requests={requests} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};