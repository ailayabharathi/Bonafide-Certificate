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
import { ArrowUpDown, ArrowUp, ArrowDown, User, Eye } from "lucide-react"; // Added Eye icon
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
import { Link } from "react-router-dom"; // Added Link import
import { RequestsTableContent } from "./RequestsTableContent"; // Import the new component
import { useStaffRequestsTableLogic } from "@/hooks/useStaffRequestsTableLogic"; // Import the new hook

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

  const [actionRequest, setActionRequest] = useState<BonafideRequestWithProfile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revert' | null>(null);
  const [isBulk, setIsBulk] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [studentUserIdToView, setStudentUserIdToView] = useState<string | null>(null);

  const openActionDialog = (type: 'approve' | 'reject' | 'revert', bulk: boolean, request?: BonafideRequestWithProfile) => {
    setActionType(type);
    setIsBulk(bulk);
    setActionRequest(request || null);
  };

  const closeActionDialog = () => {
    setActionRequest(null);
    setActionType(null);
    setIsBulk(false);
  };

  const handleConfirmAction = async (rejectionReason?: string) => {
    if (!actionType || !profile) return;
    if (!isBulk && !actionRequest) return;
    if (isBulk && selectedIds.length === 0) return;

    setIsSubmitting(true);
    let newStatus: BonafideStatus;

    if (actionType === 'approve') {
      if (profile.role === 'tutor') newStatus = 'approved_by_tutor';
      else if (profile.role === 'hod') newStatus = 'approved_by_hod';
      else if (profile.role === 'admin') newStatus = 'completed';
      else return;
    } else if (actionType === 'revert') {
        if (profile.role !== 'admin') return;
        newStatus = 'approved_by_hod';
    } else { // reject
      if (profile.role === 'tutor') newStatus = 'rejected_by_tutor';
      else if (profile.role === 'hod') newStatus = 'rejected_by_hod';
      else return;
    }

    if (isBulk) {
      await onBulkAction(selectedIds, newStatus, rejectionReason);
      setSelectedIds([]);
    } else if (actionRequest) {
      await onAction(actionRequest.id, newStatus, rejectionReason);
    }

    setIsSubmitting(false);
    closeActionDialog();
  };

  const handleViewProfile = (userId: string) => {
    setStudentUserIdToView(userId);
    setIsProfileDialogOpen(true);
  };
  
  const getApproveButtonText = () => {
      if (profile?.role === 'admin') return 'Mark as Completed';
      return 'Approve';
  }

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
            <RequestsTableContent
              requestsToRender={paginatedRequestsForCurrentTab}
              profile={profile}
              onViewProfile={handleViewProfile}
              onOpenActionDialog={openActionDialog}
              getApproveButtonText={getApproveButtonText}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAllOnPage}
              sortConfig={sortConfig as { key: string; direction: 'ascending' | 'descending' }}
              onSort={handleSort}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
              totalPages={totalPagesForCurrentTab}
              actionableIdsOnPage={actionableIdsOnPage}
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