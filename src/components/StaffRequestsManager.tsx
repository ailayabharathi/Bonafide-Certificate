import { useMemo, useCallback, useState, useEffect } from "react";
import { BonafideRequestWithProfile, SortConfig } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffRequestsTableActions } from "@/hooks/useStaffRequestsTableActions";
import { getStaffTableColumns } from "@/lib/staff-table-columns";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/DataTable";
import { StaffRequestsToolbar } from "./StaffRequestsToolbar";
import { RequestActionDialog } from "./RequestActionDialog";
import { StudentProfileDialog } from "./StudentProfileDialog";
import { useBonafideRequests } from "@/hooks/useBonafideRequests";
import { DateRange } from "react-day-picker";
import { showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { BonafideRequest } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

const ITEMS_PER_PAGE = 10;

interface StaffRequestsManagerProps {
  tabsInfo: { value: string; label: string; count: number }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (filter: string) => void;
  onClearFilters: () => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  dateRange: DateRange | undefined;
}

export function StaffRequestsManager({ 
  tabsInfo,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentFilterChange,
  onClearFilters,
  sortConfig,
  onSortChange,
  dateRange,
}: StaffRequestsManagerProps) {
  const { profile } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [activeTab, debouncedSearchQuery, departmentFilter, sortConfig, dateRange]);

  const statusFilter = useMemo(() => {
    if (activeTab === 'actionable') {
      if (profile?.role === 'tutor') return 'pending';
      if (profile?.role === 'hod') return 'approved_by_tutor';
      if (profile?.role === 'admin') return 'approved_by_hod';
    }
    if (activeTab === 'inProgress') return 'in_progress';
    if (activeTab === 'rejected') return 'rejected';
    if (activeTab === 'completed') return 'completed';
    return 'all';
  }, [activeTab, profile]);

  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<BonafideRequest>) => {
    if (payload.eventType !== 'UPDATE' && payload.eventType !== 'INSERT') return;
    const newStatus = payload.new.status;
    let message = "";
    if (profile?.role === 'tutor' && newStatus === 'pending' && payload.eventType === 'INSERT') {
      message = "New request received for your review.";
    } else if (profile?.role === 'hod' && newStatus === 'approved_by_tutor') {
      message = "A request requires your approval.";
    } else if (profile?.role === 'admin' && newStatus === 'approved_by_hod') {
      message = "A request is ready for final processing.";
    }
    if (message) {
      showSuccess(message);
    }
  };

  const { requests, count, updateRequest, bulkUpdateRequest, exportData, isExporting } = useBonafideRequests(
    `staff-requests-manager:${profile?.role}`,
    { 
      startDate: dateRange?.from, 
      endDate: dateRange?.to, 
      searchQuery: debouncedSearchQuery, 
      statusFilter, 
      sortConfig, 
      departmentFilter,
      page: currentPage,
    },
    handleRealtimeEvent
  );

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  const isRowSelectable = useCallback((request: BonafideRequestWithProfile) => {
    if (profile?.role === 'tutor') return request.status === 'pending';
    if (profile?.role === 'hod') return request.status === 'approved_by_tutor';
    if (profile?.role === 'admin') return request.status === 'approved_by_hod';
    return false;
  }, [profile]);

  const selectableRowIdsOnPage = useMemo(() => 
    isRowSelectable 
      ? requests.filter(isRowSelectable).map(r => r.id)
      : [],
    [requests, isRowSelectable]
  );

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };

  const handleSelectAllOnPage = (checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...new Set([...prev, ...selectableRowIdsOnPage])]);
    } else {
      setSelectedIds(prev => prev.filter(id => !selectableRowIdsOnPage.includes(id)));
    }
  };

  const {
    actionRequest,
    actionType,
    isBulk,
    isSubmitting,
    isProfileDialogOpen,
    studentUserIdToView,
    openActionDialog,
    closeActionDialog,
    handleConfirmAction,
    handleViewProfile,
    setIsProfileDialogOpen,
  } = useStaffRequestsTableActions({
    profile,
    onAction: (requestId, newStatus, rejectionReason) => updateRequest({ requestId, newStatus, rejectionReason }), // Fixed: Correctly pass arguments as object
    onBulkAction: (requestIds, newStatus, rejectionReason) => bulkUpdateRequest({ requestIds, newStatus, rejectionReason }), // Fixed: Correctly pass arguments as object
    selectedIds,
    setSelectedIds,
  });

  const columns = useMemo(() => getStaffTableColumns({
    profile,
    onViewProfile: handleViewProfile,
    onOpenActionDialog: openActionDialog,
  }), [profile, handleViewProfile, openActionDialog]);

  return (
    <div className="border rounded-md bg-background">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <StaffRequestsToolbar
          tabs={tabsInfo}
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={onDepartmentFilterChange}
          selectedIdsCount={selectedIds.length}
          onBulkAction={(type) => openActionDialog(type, true)}
          onClearSelection={() => setSelectedIds([])}
          profile={profile}
          onClearFilters={onClearFilters}
          onExport={exportData}
          isExporting={isExporting}
        />
        {tabsInfo.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="m-0">
            <DataTable
              columns={columns}
              data={requests}
              sortConfig={sortConfig as { key: string; direction: 'ascending' | 'descending' }}
              onSort={(key) => onSortChange({ key, direction: sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending' })}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
              enableRowSelection={true}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAllOnPage}
              selectableRowIds={selectableRowIdsOnPage}
              rowKey={(row) => row.id}
            />
          </TabsContent>
        ))}
      </Tabs>

      <RequestActionDialog
        isOpen={!!actionType}
        onOpenChange={(open) => !open && closeActionDialog()}
        actionType={actionType}
        isBulk={isBulk}
        request={actionRequest}
        selectedIdsCount={selectedIds.length}
        onConfirm={handleConfirmAction}
        isSubmitting={isSubmitting}
        profile={profile}
      />

      <StudentProfileDialog
        isOpen={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        userId={studentUserIdToView}
      />
    </div>
  );
}