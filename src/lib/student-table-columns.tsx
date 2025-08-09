import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { BonafideRequest, ColumnDef } from "@/types";
import { cn, getStatusVariant, formatStatus } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, Edit, Trash2 } from "lucide-react";

interface GetStudentTableColumnsProps {
  onEdit: (request: BonafideRequest) => void;
  onCancel: (requestId: string) => void; // Changed to accept only ID
}

const isRejected = (status: BonafideRequest['status']) => 
  status === 'rejected_by_tutor' || status === 'rejected_by_hod';

export const getStudentTableColumns = ({
  onEdit,
  onCancel,
}: GetStudentTableColumnsProps): ColumnDef<BonafideRequest>[] => {
  return [
    {
      id: 'created_at',
      header: 'Date Submitted',
      cell: ({ row }: { row: BonafideRequest }) => new Date(row.created_at).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'reason',
      header: 'Reason',
      cell: ({ row }: { row: BonafideRequest }) => <div className="max-w-xs truncate">{row.reason}</div>,
      enableSorting: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: BonafideRequest }) => (
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
      cell: ({ row }: { row: BonafideRequest }) => (
        <div className="flex gap-1 justify-end">
          {row.status === 'completed' && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/certificate/${row.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </Button>
          )}
          {isRejected(row.status) && (
            <Button variant="secondary" size="sm" onClick={() => onEdit(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit & Resubmit
            </Button>
          )}
          {row.status === 'pending' && (
            <Button variant="destructive" size="sm" onClick={() => onCancel(row.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];
};