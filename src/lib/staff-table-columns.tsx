import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BonafideRequestWithProfile, BonafideStatus, ColumnDef } from "@/types"; // Import ColumnDef from types
import { cn, getStatusVariant, formatStatus } from "@/lib/utils"; // Import from utils
import { Profile } from "@/contexts/AuthContext";
import { User, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

interface GetStaffTableColumnsProps {
  profile: Profile | null;
  onViewProfile: (userId: string) => void;
  onOpenActionDialog: (type: 'approve' | 'reject' | 'revert', bulk: boolean, request?: BonafideRequestWithProfile) => void;
  getApproveButtonText: () => string;
}

export const getStaffTableColumns = ({
  profile,
  onViewProfile,
  onOpenActionDialog,
  getApproveButtonText,
}: GetStaffTableColumnsProps): ColumnDef<BonafideRequestWithProfile>[] => {
  const getActionability = (status: BonafideStatus) => {
    if (profile?.role === 'tutor') return status === 'pending';
    if (profile?.role === 'hod') return status === 'approved_by_tutor';
    if (profile?.role === 'admin') return status === 'approved_by_hod';
    return false;
  };

  return [
    {
      id: 'studentName',
      header: 'Student Name',
      cell: ({ row }: { row: BonafideRequestWithProfile }) => `${row.profiles?.first_name || ''} ${row.profiles?.last_name || ''}`,
      enableSorting: true,
    },
    {
      id: 'register_number',
      header: 'Register No.',
      cell: ({ row }: { row: BonafideRequestWithProfile }) => row.profiles?.register_number || 'N/A',
    },
    {
      id: 'department',
      header: 'Department',
      cell: ({ row }: { row: BonafideRequestWithProfile }) => row.profiles?.department || 'N/A',
    },
    {
      id: 'created_at',
      header: 'Submitted',
      cell: ({ row }: { row: BonafideRequestWithProfile }) => new Date(row.created_at).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'reason',
      header: 'Reason',
      cell: ({ row }: { row: BonafideRequestWithProfile }) => <div className="max-w-[200px] truncate">{row.reason}</div>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: BonafideRequestWithProfile }) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={getStatusVariant(row.status)} className={cn(row.status === 'completed' && 'bg-green-500 text-white')}>
            {formatStatus(row.status)}
          </Badge>
          {row.rejection_reason && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-destructive max-w-[200px] truncate cursor-help">
                    Reason: {row.rejection_reason}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.rejection_reason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: BonafideRequestWithProfile }) => (
        <div className="flex gap-2">
          {row.profiles && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={() => onViewProfile(row.user_id)}>
                    <User className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Student Profile</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {row.status === 'completed' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/certificate/${row.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Certificate</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {getActionability(row.status) ? (
            <>
              <Button size="sm" variant="outline" onClick={() => onOpenActionDialog('approve', false, row)}>{getApproveButtonText()}</Button>
              {profile?.role !== 'admin' && <Button size="sm" variant="destructive" onClick={() => onOpenActionDialog('reject', false, row)}>Reject</Button>}
            </>
          ) : profile?.role === 'admin' && row.status === 'completed' ? (
            <Button size="sm" variant="secondary" onClick={() => onOpenActionDialog('revert', false, row)}>Revert</Button>
          ) : (
            <span className="text-xs text-muted-foreground">No action needed</span>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];
};