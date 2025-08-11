import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ColumnDef, ManagedUser } from "@/types";

interface GetStudentListColumnsProps {
  onViewRequests: (student: ManagedUser) => void;
}

export const getStudentListColumns = ({ onViewRequests }: GetStudentListColumnsProps): ColumnDef<ManagedUser>[] => {
  return [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }: { row: ManagedUser }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatar_url || undefined} alt="Avatar" />
            <AvatarFallback>{`${row.first_name?.charAt(0) || ''}${row.last_name?.charAt(0) || ''}`}</AvatarFallback>
          </Avatar>
          <span>{`${row.first_name || ''} ${row.last_name || ''}`}</span>
        </div>
      ),
      enableSorting: true,
    },
    {
      id: 'register_number',
      header: 'Register Number',
      cell: ({ row }: { row: ManagedUser }) => row.register_number || 'N/A',
      enableSorting: true,
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }: { row: ManagedUser }) => row.email,
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: ManagedUser }) => (
        <Button variant="outline" size="sm" onClick={() => onViewRequests(row)}>
          <Eye className="mr-2 h-4 w-4" />
          View Requests
        </Button>
      ),
      className: "text-right",
    },
  ];
};