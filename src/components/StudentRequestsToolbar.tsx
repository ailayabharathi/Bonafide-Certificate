import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface StudentRequestsToolbarProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const StudentRequestsToolbar = ({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
}: StudentRequestsToolbarProps) => {
  return (
    <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Filter by status..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Search by reason..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xs"
      />
    </div>
  );
};