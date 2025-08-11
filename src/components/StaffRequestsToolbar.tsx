import { useState } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Profile } from "@/contexts/AuthContext";
import { ExportButton } from "./ExportButton";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departments } from "@/lib/departments";
import { getApproveButtonTextForRole } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { exportToCsv } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";

interface TabInfo {
  value: string;
  label: string;
  count: number;
}

interface StaffRequestsToolbarProps {
  tabs: TabInfo[];
  activeTab: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  selectedIdsCount: number;
  onBulkAction: (type: 'approve' | 'reject') => void;
  onClearSelection: () => void;
  profile: Profile | null;
  onClearFilters: () => void;
  statusFilter: string;
  dateRange?: DateRange;
}

export const StaffRequestsToolbar = ({
  tabs,
  activeTab,
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentFilterChange,
  selectedIdsCount,
  onBulkAction,
  onClearSelection,
  profile,
  onClearFilters,
  statusFilter,
  dateRange,
}: StaffRequestsToolbarProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const showClearFilters = searchQuery !== "" || departmentFilter !== "all" || activeTab !== "actionable";

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from("bonafide_requests")
        .select("*, profiles!inner(first_name, last_name, department, register_number)");

      if (dateRange?.from) query = query.gte("created_at", dateRange.from.toISOString());
      if (dateRange?.to) query = query.lte("created_at", dateRange.to.toISOString());
      if (searchQuery) query = query.or(`reason.ilike.%${searchQuery}%,profiles.first_name.ilike.%${searchQuery}%,profiles.last_name.ilike.%${searchQuery}%,profiles.register_number.ilike.%${searchQuery}%`);
      if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'in_progress') query = query.in('status', ['pending', 'approved_by_tutor', 'approved_by_hod']);
        else if (statusFilter === 'rejected') query = query.in('status', ['rejected_by_tutor', 'rejected_by_hod']);
        else query = query.eq('status', statusFilter as BonafideStatus);
      }
      if (departmentFilter && departmentFilter !== 'all') query = query.eq('profiles.department', departmentFilter);

      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        showError("There is no data to export for the current filters.");
        return;
      }

      const flattenedData = (data as BonafideRequestWithProfile[]).map(request => ({
          id: request.id,
          student_name: `${request.profiles?.first_name || ''} ${request.profiles?.last_name || ''}`,
          register_number: request.profiles?.register_number || '',
          department: request.profiles?.department || '',
          reason: request.reason,
          status: request.status,
          rejection_reason: request.rejection_reason || '',
          submitted_at: new Date(request.created_at).toISOString(),
          last_updated_at: new Date(request.updated_at).toISOString(),
        }));

      exportToCsv(`bonafide-requests-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`, flattenedData);
      showSuccess("Data exported successfully!");
    } catch (error: any) {
      showError(error.message || "An error occurred during the export.");
    } finally {
      setIsExporting(false);
    }
  };

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
          <ExportButton onExport={handleExport} isExporting={isExporting} />
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
          <Button size="sm" onClick={() => onBulkAction('approve')}>{getApproveButtonTextForRole(profile?.role)} Selected</Button>
          {profile?.role !== 'admin' && <Button size="sm" variant="destructive" onClick={() => onBulkAction('reject')}>Reject Selected</Button>}
          <Button size="sm" variant="ghost" onClick={onClearSelection}>Clear selection</Button>
        </div>
      )}
    </div>
  );
};