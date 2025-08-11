import { useMemo, useCallback } from "react";
import { BonafideRequestWithProfile, BonafideStatus, SortConfig } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDataTable } from "@/hooks/useDataTable";
import { useStaffRequestsTableActions } from "@/hooks/useStaffRequestsTableActions";
import { getStaffTableColumns } from "@/lib/staff-table-columns";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/DataTable";
import { StaffRequestsToolbar } from "./StaffRequestsToolbar";
import { RequestActionDialog } from "./RequestActionDialog";
import { StudentProfileDialog } from "./StudentProfileDialog";

interface StaffRequestsManagerProps {
  requests: BonafideRequestWithProfile[];
  onAction: (requestId: string, newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
  onBulkAction: (requestIds: string[], newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
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
}

export function StaffRequestsManager({ 
  requests, 
  onAction, 
  onBulkAction,
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
}: StaffRequestsManagerProps) {
  const { profile } = useAuth();

  const isRowSelectable = useCallback((request: BonafideRequestWithProfile) => {
    if (profile?.role === 'tutor') return request.status === 'pending';
    if (profile?.role === 'hod') return request.status === 'approved_by_tutor';
    if (profile?.role === 'admin') return request.status === 'approved_by_hod';
    return false;
  }, [profile]);

  const {
    paginatedRows,
    currentPage,
    setCurrentPage,
    totalPages,
    selectedIds,
    setSelectedIds,
    handleToggleSelect,
    handleSelectAllOnPage,
    selectableRowIdsOnPage,
  } = useDataTable({
    data: requests,
    rowKey: (row) => row.id,
    isRowSelectable,
  });

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
    getApproveButtonText,
    setIsProfileDialogOpen,
  } = useStaffRequestsTableActions({
    profile,
    onAction,
    onBulkAction,
    selectedIds,
    setSelectedIds,
  });

  const columns = useMemo(() => getStaffTableColumns({
    profile,
    onViewProfile: handleViewProfile,
    onOpenActionDialog: openActionDialog,
    getApproveButtonText,
  }), [profile, handleViewProfile, openActionDialog, getApproveButtonText]);

  return (
    <div className="border rounded-md bg-background">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <StaffRequestsToolbar
          tabs={tabsInfo}
          activeTab={activeTab}
          requestsForExport={requests}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={onDepartmentFilterChange}
          selectedIdsCount={selectedIds.length}
          onBulkAction={(type) => openActionDialog(type, true)}
          onClearSelection={() => setSelectedIds([])}
          getApproveButtonText={getApproveButtonText}
          profile={profile}
          onClearFilters={onClearFilters}
        />
        {tabsInfo.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="m-0">
            <DataTable
              columns={columns}
              data={paginatedRows}
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
        getApproveButtonText={getApproveButtonText}
      />

      <StudentProfileDialog
        isOpen={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        userId={studentUserIdToView}
      />
    </div>
  );
}