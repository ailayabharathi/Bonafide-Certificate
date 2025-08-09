import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Profile } from "@/contexts/AuthContext";
import { User, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { DataTable } from "./DataTable"; // Import DataTable
import { getStaffTableColumns } from "@/lib/staff-table-columns"; // Import the new utility

interface RequestsTableContentProps {
  requestsToRender: BonafideRequestWithProfile[];
  profile: Profile | null;
  onViewProfile: (userId: string) => void;
  onOpenActionDialog: (type: 'approve' | 'reject' | 'revert', bulk: boolean, request?: BonafideRequestWithProfile) => void;
  getApproveButtonText: () => string;
  selectedIds: string[];
  onToggleSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  sortConfig: { key: string; direction: 'descending' | 'ascending' };
  onSort: (key: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export function RequestsTableContent({
  requestsToRender,
  profile,
  onViewProfile,
  onOpenActionDialog,
  getApproveButtonText,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  sortConfig,
  onSort,
  currentPage,
  onPageChange,
  totalPages,
}: RequestsTableContentProps) {

  const getActionability = (status: BonafideStatus) => {
    if (profile?.role === 'tutor') return status === 'pending';
    if (profile?.role === 'hod') return status === 'approved_by_tutor';
    if (profile?.role === 'admin') return status === 'approved_by_hod';
    return false;
  };

  const actionableIdsOnPage = useMemo(() => 
    requestsToRender.filter(r => getActionability(r.status)).map(r => r.id),
    [requestsToRender, profile]
  );

  const columns = useMemo(() => getStaffTableColumns({
    profile,
    onViewProfile,
    onOpenActionDialog,
    getApproveButtonText,
  }), [profile, onViewProfile, onOpenActionDialog, getApproveButtonText]);

  return (
    <DataTable
      columns={columns}
      data={requestsToRender}
      sortConfig={sortConfig}
      onSort={onSort}
      currentPage={currentPage}
      onPageChange={onPageChange}
      totalPages={totalPages}
      enableRowSelection={true}
      selectedIds={selectedIds}
      onToggleSelect={onToggleSelect}
      onSelectAll={onSelectAll}
      actionableIdsOnPage={actionableIdsOnPage}
      rowKey={(row) => row.id}
    />
  );
}