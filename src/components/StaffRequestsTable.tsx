import { useMemo, useCallback } from "react";
import { BonafideRequestWithProfile, BonafideStatus, SortConfig } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDataTable } from "@/hooks/useDataTable";
import { useStaffRequestsTableActions } from "@/hooks/useStaffRequestsTableActions";
import { getStaffTableColumns } from "@/lib/staff-table-columns";
import { StaffRequestsTabs } from "./StaffRequestsTabs";

interface StaffRequestsTableProps {
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

export function StaffRequestsTable({ 
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
}: StaffRequestsTableProps) {
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
      <StaffRequestsTabs
        tabsInfo={tabsInfo}
        activeTab={activeTab}
        setActiveTab={onTabChange}
        requestsForExport={requests}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={onDepartmentFilterChange}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAllOnPage}
        actionableIdsOnPage={selectableRowIdsOnPage}
        onClearSelection={() => setSelectedIds([])}
        getApproveButtonText={getApproveButtonText}
        profile={profile}
        onClearFilters={onClearFilters}
        columns={columns}
        paginatedRequestsForCurrentTab={paginatedRows}
        sortConfig={sortConfig as { key: string; direction: 'ascending' | 'descending' }}
        handleSort={(key) => onSortChange({ key, direction: sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending' })}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPagesForCurrentTab={totalPages}
        actionRequest={actionRequest}
        actionType={actionType}
        isBulk={isBulk}
        isSubmitting={isSubmitting}
        isProfileDialogOpen={isProfileDialogOpen}
        studentUserIdToView={studentUserIdToView}
        openActionDialog={openActionDialog}
        closeActionDialog={closeActionDialog}
        handleConfirmAction={handleConfirmAction}
        setIsProfileDialogOpen={setIsProfileDialogOpen}
      />
    </div>
  );
}