import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BonafideRequest } from "@/types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Eye, Edit } from "lucide-react";

interface RequestsTableProps {
  requests: BonafideRequest[];
  onEdit: (request: BonafideRequest) => void;
}

const getStatusVariant = (status: BonafideRequest['status']) => {
  switch (status) {
    case 'pending':
      return 'default';
    case 'approved_by_tutor':
    case 'approved_by_hod':
      return 'outline';
    case 'completed':
      return 'default';
    case 'rejected_by_tutor':
    case 'rejected_by_hod':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function RequestsTable({ requests, onEdit }: RequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-md">
        <p className="text-muted-foreground">You haven't made any requests yet.</p>
      </div>
    );
  }

  const isRejected = (status: BonafideRequest['status']) => 
    status === 'rejected_by_tutor' || status === 'rejected_by_hod';

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date Submitted</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant={getStatusVariant(request.status)} className={cn(request.status === 'completed' && 'bg-green-500 text-white')}>
                        {formatStatus(request.status)}
                      </Badge>
                    </TooltipTrigger>
                    {request.rejection_reason && (
                      <TooltipContent>
                        <p>Reason: {request.rejection_reason}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-right">
                {request.status === 'completed' && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/certificate/${request.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                )}
                {isRejected(request.status) && (
                   <Button variant="secondary" size="sm" onClick={() => onEdit(request)}>
                     <Edit className="mr-2 h-4 w-4" />
                     Edit & Resubmit
                   </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}