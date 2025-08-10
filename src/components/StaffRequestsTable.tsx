import { useMemo } from "react";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useStaffRequestsTableLogic } from "@/hooks/useStaffRequestsTableLogic";
import { useStaffRequestsTableActions } from "@/hooks/useStaffRequestsTableActions";
import { getStaffTableColumns } from "@/lib/staff-table-columns";
import { StaffRequestsTabs } from "./StaffRequestsTabs"; // Import the new component

interface StaffRequestsTableProps {
  requests: BonafideRequestWithProfile[];
  onAction: (requestId: string, newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
  onBulkAction: (requestIds: string[], newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
  onClearDateRange: () => void;
}

export function StaffRequestsTable({ requests, onAction, onBulkAction, onClearDateRange }: StaffRequestsTableProps) {
  const { profile } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    selectedIds,
    setSelectedIds,
    handleToggleSelect,
    handleSelectAllOnPage,
    handleClearFilters,
    requestsForCurrentTab, // This is needed for export button in toolbar
    paginatedRequestsForCurrentTab,
    totalPagesForCurrentTab,
    tabsInfo,
    actionableIdsOnPage,
  } = useStaffRequestsTableLogic(requests, profile, onClearDateRange);

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
        setActiveTab={setActiveTab}
        requestsForExport={requestsForCurrentTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAllOnPage}
        actionableIdsOnPage={actionableIdsOnPage}
        onClearSelection={() => setSelectedIds([])}
        getApproveButtonText={getApproveButtonText}
        profile={profile}
        onClearFilters={handleClearFilters}
        columns={columns}
        paginatedRequestsForCurrentTab={paginatedRequestsForCurrentTab}
        sortConfig={sortConfig as { key: string; direction: 'ascending' | 'descending' }}
        handleSort={handleSort}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPagesForCurrentTab={totalPagesForCurrentTab}
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