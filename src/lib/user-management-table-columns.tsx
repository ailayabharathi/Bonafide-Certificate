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
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

interface GetUserManagementTableColumnsProps {
  currentUserProfile: Profile | null;
  setUserToEditRole: (user: ManagedUser) => void;
  setUserToDelete: (user: ManagedUser) => void;
  onResendInvite: (email: string) => void;
}

export const getUserManagementTableColumns = ({
  currentUserProfile,
  setUserToEditRole,
  setUserToDelete,
  onResendInvite,
}: GetUserManagementTableColumnsProps): ColumnDef<ManagedUser>[] => {
  return [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }: { row: ManagedUser }) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || '(No name set)',
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
        if (row.invited_at && !row.last_sign_in_at) {
          return <Badge variant="secondary">Invited</Badge>;
        }
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      },
      enableSorting: true,
    },
    {
      id: 'last_sign_in_at',
      header: 'Last Active',
      cell: ({ row }: { row: ManagedUser }) => {
        if (row.last_sign_in_at) {
          return formatDistanceToNow(new Date(row.last_sign_in_at), { addSuffix: true });
        }
        if (row.invited_at) {
          return `Invited ${formatDistanceToNow(new Date(row.invited_at), { addSuffix: true })}`;
        }
        return 'Never';
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: ManagedUser }) => {
        const isCurrentUser = row.id === currentUserProfile?.id;
        const isInvited = row.invited_at && !row.last_sign_in_at;

        return (
          <div className="flex gap-1 justify-end">
            {isInvited ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onResendInvite(row.email!)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Resend Invitation</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/admin/user/${row.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Edit Profile</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
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