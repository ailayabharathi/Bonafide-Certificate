import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Profile } from "@/contexts/AuthContext";
import { ExportButton } from "./ExportButton";
import { BonafideRequestWithProfile } from "@/types";
import { XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departments } from "@/lib/departments"; // Import the departments list

interface TabInfo {
  value: string;
  label: string;
  count: number;
}

interface StaffRequestsToolbarProps {
  tabs: TabInfo[];
  activeTab: string;
  requestsForExport: BonafideRequestWithProfile[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  departmentFilter: string; // New prop
  onDepartmentFilterChange: (value: string) => void; // New prop
  selectedIdsCount: number;
  onBulkAction: (type: 'approve' | 'reject') => void;
  onClearSelection: () => void;
  getApproveButtonText: () => string;
  profile: Profile | null;
  onClearFilters: () => void;
}

export const StaffRequestsToolbar = ({
  tabs,
  activeTab,
  requestsForExport,
  searchQuery,
  onSearchChange,
  departmentFilter, // Destructure new prop
  onDepartmentFilterChange, // Destructure new prop
  selectedIdsCount,
  onBulkAction,
  onClearSelection,
  getApproveButtonText,
  profile,
  onClearFilters,
}: StaffRequestsToolbarProps) => {
  const showClearFilters = searchQuery !== "" || departmentFilter !== "all" || activeTab !== "actionable";
  return (
    <div className="p-4 border-b space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label} ({tab.count})
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name, reg no, dept, reason..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-xs"
          />
          <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportButton 
            data={requestsForExport}
            filename={`bonafide-requests-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`}
          />
          {showClearFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              <XCircle className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      {selectedIdsCount > 0 && (
        <div className="flex items-center gap-4 p-2 bg-secondary rounded-md">
          <p className="text-sm font-medium">{selectedIdsCount} selected</p>
          <Button size="sm" onClick={() => onBulkAction('approve')}>{getApproveButtonText()} Selected</Button>
          {profile?.role !== 'admin' && <Button size="sm" variant="destructive" onClick={() => onBulkAction('reject')}>Reject Selected</Button>}
          <Button size="sm" variant="ghost" onClick={onClearSelection}>Clear selection</Button>
        </div>
      )}
    </div>
  );
};