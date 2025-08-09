import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ArrowUpDown, ArrowUp, ArrowDown, User, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StaffRequestsToolbar } from "./StaffRequestsToolbar";
import { RequestActionDialog } from "./RequestActionDialog";
import { StudentProfileDialog } from "./StudentProfileDialog";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Link } from "react-router-dom";
import { DataTable } from "./DataTable"; // Keep DataTable import
import { useStaffRequestsTableLogic } from "@/hooks/useStaffRequestsTableLogic";
import { useStaffRequestsTableActions } from "@/hooks/useStaffRequestsTableActions";
import { getStaffTableColumns } from "@/lib/staff-table-columns"; // Import getStaffTableColumns

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
    requestsForCurrentTab,
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <StaffRequestsToolbar
          tabs={tabsInfo}
          activeTab={activeTab}
          requestsForExport={requestsForCurrentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          selectedIdsCount={selectedIds.length}
          onBulkAction={(type) => openActionDialog(type, true)}
          onClearSelection={() => setSelectedIds([])}
          getApproveButtonText={getApproveButtonText}
          profile={profile}
          onClearFilters={handleClearFilters}
        />
        {tabsInfo.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="m-0">
            <DataTable
              columns={columns}
              data={paginatedRequestsForCurrentTab}
              sortConfig={sortConfig as { key: string; direction: 'ascending' | 'descending' }}
              onSort={handleSort}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
              totalPages={totalPagesForCurrentTab}
              enableRowSelection={true}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAllOnPage}
              actionableIdsOnPage={actionableIdsOnPage}
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