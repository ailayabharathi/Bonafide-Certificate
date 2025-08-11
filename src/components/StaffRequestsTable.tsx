import { useMemo } from "react";
import { BonafideRequestWithProfile, BonafideStatus, SortConfig } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffRequestsTableLogic } from "@/hooks/useStaffRequestsTableLogic";
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
  const {
    currentPage,
    setCurrentPage,
    selectedIds,
    setSelectedIds,
    handleToggleSelect,
    handleSelectAllOnPage,
    paginatedRequests,
    totalPages,
    actionableIdsOnPage,
  } = useStaffRequestsTableLogic(requests, profile);

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
        actionableIdsOnPage={actionableIdsOnPage}
        onClearSelection={() => setSelectedIds([])}
        getApproveButtonText={getApproveButtonText}
        profile={profile}
        onClearFilters={onClearFilters}
        columns={columns}
        paginatedRequestsForCurrentTab={paginatedRequests}
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