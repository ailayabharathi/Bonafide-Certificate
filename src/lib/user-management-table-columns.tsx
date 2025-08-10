import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, UserCog, Trash2, Send } from "lucide-react";
import { Profile } from "@/contexts/AuthContext";
import { ManagedUser, ColumnDef } from "@/types";
import { Badge } from "@/components/ui/badge";

interface GetUserManagementTableColumnsProps {
  currentUserProfile: Profile | null;
  setUserToEditProfile: (user: ManagedUser) => void;
  setUserToEditRole: (user: ManagedUser) => void;
  setUserToDelete: (user: ManagedUser) => void;
  onResendInvite: (email: string, role: 'student' | 'tutor' | 'hod' | 'admin') => Promise<void>;
}

export const getUserManagementTableColumns = ({
  currentUserProfile,
  setUserToEditProfile,
  setUserToEditRole,
  setUserToDelete,
  onResendInvite,
}: GetUserManagementTableColumnsProps): ColumnDef<ManagedUser>[] => {
  return [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }: { row: ManagedUser }) => `${row.first_name || ''} ${row.last_name || ''}` || '(No name set)',
      enableSorting: true,
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }: { row: ManagedUser }) => row.email,
      enableSorting: true,
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }: { row: ManagedUser }) => <span className="capitalize">{row.role}</span>,
      enableSorting: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: ManagedUser }) => {
        const isInvited = row.invited_at && !row.last_sign_in_at;
        return isInvited ? (
          <Badge variant="secondary">Invited</Badge>
        ) : (
          <Badge variant="default" className="bg-green-500">Active</Badge>
        );
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: ManagedUser }) => {
        const isCurrentUser = row.id === currentUserProfile?.id;
        const isInvited = row.invited_at && !row.last_sign_in_at;

        return (
          <div className="flex gap-1 justify-end">
            {isInvited && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onResendInvite(row.email!, row.role)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Resend Invitation</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
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
                      onClick={() => setUserToDelete(row)}
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
        );
      },
      className: "text-right",
    },
  ];
};