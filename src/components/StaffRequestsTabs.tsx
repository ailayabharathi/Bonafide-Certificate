import { useMemo } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/DataTable";
import { StaffRequestsToolbar } from "./StaffRequestsToolbar";
import { RequestActionDialog } from "./RequestActionDialog";
import { StudentProfileDialog } from "./StudentProfileDialog";
import { BonafideRequestWithProfile, BonafideStatus, ColumnDef } from "@/types";
import { Profile } from "@/contexts/AuthContext";

interface StaffRequestsTabsProps {
  tabsInfo: { value: string; label: string; count: number }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  requestsForExport: BonafideRequestWithProfile[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  actionableIdsOnPage: string[];
  onClearSelection: () => void;
  getApproveButtonText: () => string;
  profile: Profile | null;
  onClearFilters: () => void;
  columns: ColumnDef<BonafideRequestWithProfile>[];
  paginatedRequestsForCurrentTab: BonafideRequestWithProfile[];
  sortConfig: { key: string; direction: 'ascending' | 'descending' };
  handleSort: (key: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPagesForCurrentTab: number;
  actionRequest: BonafideRequestWithProfile | null;
  actionType: 'approve' | 'reject' | 'revert' | null;
  isBulk: boolean;
  isSubmitting: boolean;
  isProfileDialogOpen: boolean;
  studentUserIdToView: string | null;
  openActionDialog: (type: 'approve' | 'reject' | 'revert', bulk: boolean, request?: BonafideRequestWithProfile) => void;
  closeActionDialog: () => void;
  handleConfirmAction: (rejectionReason?: string) => Promise<void>;
  setIsProfileDialogOpen: (open: boolean) => void;
}

export function StaffRequestsTabs({
  tabsInfo,
  activeTab,
  setActiveTab,
  requestsForExport,
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentFilterChange,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  actionableIdsOnPage,
  onClearSelection,
  getApproveButtonText,
  profile,
  onClearFilters,
  columns,
  paginatedRequestsForCurrentTab,
  sortConfig,
  handleSort,
  currentPage,
  setCurrentPage,
  totalPagesForCurrentTab,
  actionRequest,
  actionType,
  isBulk,
  isSubmitting,
  isProfileDialogOpen,
  studentUserIdToView,
  openActionDialog,
  closeActionDialog,
  handleConfirmAction,
  setIsProfileDialogOpen,
}: StaffRequestsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <StaffRequestsToolbar
        tabs={tabsInfo}
        activeTab={activeTab}
        requestsForExport={requestsForExport}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={onDepartmentFilterChange}
        selectedIdsCount={selectedIds.length}
        onBulkAction={(type) => openActionDialog(type, true)}
        onClearSelection={onClearSelection}
        getApproveButtonText={getApproveButtonText}
        profile={profile}
        onClearFilters={onClearFilters}
      />
      {tabsInfo.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="m-0">
          <DataTable
            columns={columns}
            data={paginatedRequestsForCurrentTab}
            sortConfig={sortConfig}
            onSort={handleSort}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={totalPagesForCurrentTab}
            enableRowSelection={true}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onSelectAll={onSelectAll}
            actionableIdsOnPage={actionableIdsOnPage}
            rowKey={(row) => row.id}
          />
        </TabsContent>
      ))}

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
    </Tabs>
  );
}