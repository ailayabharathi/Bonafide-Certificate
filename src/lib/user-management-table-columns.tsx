import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, UserCog, Trash2, Send } from "lucide-react";
import { Profile } from "@/contexts/AuthContext";
import { ColumnDef, FullUserProfile } from "@/types";
import { Badge } from "@/components/ui/badge";

interface GetUserManagementTableColumnsProps {
  currentUserProfile: Profile | null;
  setUserToEditProfile: (user: Profile) => void;
  setUserToEditRole: (user: Profile) => void;
  setUserToDelete: (user: Profile) => void;
  onResendInvite: (user: FullUserProfile) => void;
}

export const getUserManagementTableColumns = ({
  currentUserProfile,
  setUserToEditProfile,
  setUserToEditRole,
  setUserToDelete,
  onResendInvite,
}: GetUserManagementTableColumnsProps): ColumnDef<FullUserProfile>[] => {
  return [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }: { row: FullUserProfile }) => `${row.first_name} ${row.last_name}`,
      enableSorting: true,
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }: { row: FullUserProfile }) => row.email,
      enableSorting: true,
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }: { row: FullUserProfile }) => <span className="capitalize">{row.role}</span>,
      enableSorting: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: FullUserProfile }) => (
        <Badge variant={row.status === 'Active' ? 'default' : 'secondary'} className={row.status === 'Active' ? 'bg-green-500 text-white hover:bg-green-600' : ''}>
          {row.status}
        </Badge>
      ),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: FullUserProfile }) => {
        const isCurrentUser = row.id === currentUserProfile?.id;
        return (
          <div className="flex gap-1 justify-end">
            {row.status === 'Invited' && !isCurrentUser && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onResendInvite(row)}>
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