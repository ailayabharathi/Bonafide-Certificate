import { useMemo } from "react";
import { Profile } from "@/contexts/AuthContext";
import { ColumnDef } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, UserCog, Trash2 } from "lucide-react";

interface GetUserManagementTableColumnsProps {
  currentUser: Profile | null;
  currentUserProfile: Profile | null;
  setUserToEditProfile: (user: Profile) => void;
  setUserToEditRole: (user: Profile) => void;
  setUserToDelete: (user: Profile) => void;
}

export const getUserManagementTableColumns = ({
  currentUser,
  currentUserProfile,
  setUserToEditProfile,
  setUserToEditRole,
  setUserToDelete,
}: GetUserManagementTableColumnsProps): ColumnDef<Profile>[] => {
  return [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }: { row: Profile }) => `${row.first_name} ${row.last_name}`,
      enableSorting: true,
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }: { row: Profile }) => row.email,
      enableSorting: true,
    },
    {
      id: 'register_number',
      header: 'Register No.',
      cell: ({ row }: { row: Profile }) => row.register_number || 'N/A',
      enableSorting: true,
    },
    {
      id: 'department',
      header: 'Department',
      cell: ({ row }: { row: Profile }) => row.department || 'N/A',
      enableSorting: true,
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }: { row: Profile }) => <span className="capitalize">{row.role}</span>,
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: Profile }) => {
        const isCurrentUser = row.id === currentUser?.id;
        return (
          <div className="flex gap-1 justify-end">
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
                      disabled={isCurrentUser || currentUserProfile?.role !== 'admin'}
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {isCurrentUser ? <p>You cannot edit your own role.</p> : currentUserProfile?.role !== 'admin' ? <p>Only administrators can edit roles.</p> : <p>Edit Role</p>}
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
                      disabled={isCurrentUser || currentUserProfile?.role !== 'admin'}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {isCurrentUser ? <p>You cannot delete yourself.</p> : currentUserProfile?.role !== 'admin' ? <p>Only administrators can delete users.</p> : <p>Delete User</p>}
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