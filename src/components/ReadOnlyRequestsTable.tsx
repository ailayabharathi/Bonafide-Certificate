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
import { getStatusVariant, formatStatus } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReadOnlyRequestsTableProps {
  requests: BonafideRequest[];
}

export const ReadOnlyRequestsTable = ({ requests }: ReadOnlyRequestsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.length > 0 ? (
          requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-1">
                  <Badge variant={getStatusVariant(request.status)}>
                    {formatStatus(request.status)}
                  </Badge>
                  {request.rejection_reason && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-destructive max-w-[200px] truncate cursor-help">
                            Reason: {request.rejection_reason}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{request.rejection_reason}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="h-24 text-center">
              This student has not made any requests yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};