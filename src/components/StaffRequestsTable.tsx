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

interface StaffRequestsTableProps {
  requests: BonafideRequestWithProfile[];
  onAction: (requestId: string, newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
  onBulkAction: (requestIds: string[], newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
  onClearDateRange: () => void;
}

type SortableKey = keyof BonafideRequestWithProfile | 'studentName';

const getStatusVariant = (status: BonafideStatus) => {
  switch (status) {
    case 'pending': return 'default';
    case 'approved_by_tutor':
    case 'approved_by_hod': return 'outline';
    case 'completed': return 'default';
    case 'rejected_by_tutor':
    case 'rejected_by_hod': return 'destructive';
    default: return 'secondary';
  }
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function StaffRequestsTable({ requests, onAction, onBulkAction, onClearDateRange }: StaffRequestsTableProps) {
  const { profile } = useAuth();
  const [actionRequest, setActionRequest] = useState<BonafideRequestWithProfile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revert' | null>(null);
  const [isBulk, setIsBulk] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("actionable");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'descending' | 'ascending' }>({ key: 'created_at', direction: 'descending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false); // Initialized
  const [studentUserIdToView, setStudentUserIdToView] = useState<string | null>(null); // Initialized
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [activeTab, searchQuery, departmentFilter, sortConfig]);

  const handleSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

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

  const processedRequests = useMemo(() => {
    let filteredRequests = [...requests];

    // Apply department filter
    if (departmentFilter !== "all") {
      filteredRequests = filteredRequests.filter(r =>
        r.profiles?.department === departmentFilter
      );
    }

    // Apply search query filter
    filteredRequests = filteredRequests.filter(request => {
      const studentName = `${request.profiles?.first_name || ''} ${request.profiles?.last_name || ''}`.toLowerCase();
      const registerNumber = request.profiles?.register_number?.toLowerCase() || '';
      const department = request.profiles?.department?.toLowerCase() || '';
      const reason = request.reason.toLowerCase();
      const query = searchQuery.toLowerCase();
      return studentName.includes(query) || registerNumber.includes(query) || department.includes(query) || reason.includes(query);
    });

    // Apply sorting
    filteredRequests.sort((a, b) => {
        let aValue: any, bValue: any;

        if (sortConfig.key === 'studentName') {
            aValue = `${a.profiles?.first_name || ''} ${a.profiles?.last_name || ''}`.toLowerCase();
            bValue = `${b.profiles?.first_name || ''} ${b.profiles?.last_name || ''}`.toLowerCase();
        } else {
            aValue = a[sortConfig.key as keyof BonafideRequestWithProfile];
            bValue = b[sortConfig.key as keyof BonafideRequestWithProfile];
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    return filteredRequests;
  }, [requests, searchQuery, departmentFilter, sortConfig]);

  const categorizedRequests = useMemo(() => {
    if (!profile) return { actionable: [], inProgress: [], completed: [], rejected: [], all: [] };

    const actionable = (() => {
      if (profile.role === 'tutor') return processedRequests.filter(r => r.status === 'pending');
      if (profile.role === 'hod') return processedRequests.filter(r => r.status === 'approved_by_tutor');
      if (profile.role === 'admin') return processedRequests.filter(r => r.status === 'approved_by_hod');
      return [];
    })();

    return {
      actionable,
      inProgress: processedRequests.filter(r => ['pending', 'approved_by_tutor', 'approved_by_hod'].includes(r.status)),
      completed: processedRequests.filter(r => r.status === 'completed'),
      rejected: processedRequests.filter(r => ['rejected_by_tutor', 'rejected_by_hod'].includes(r.status)),
      all: processedRequests,
    };
  }, [processedRequests, profile]);

  const tabsInfo = useMemo(() => [
    { value: 'actionable', label: 'Action Required', count: categorizedRequests.actionable.length },
    { value: 'inProgress', label: 'In Progress', count: categorizedRequests.inProgress.length },
    { value: 'completed', label: 'Completed', count: categorizedRequests.completed.length },
    { value: 'rejected', label: 'Rejected', count: categorizedRequests.rejected.length },
    { value: 'all', label: 'All', count: categorizedRequests.all.length },
  ], [categorizedRequests]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("all");
    setActiveTab("actionable");
    setSelectedIds([]);
    onClearDateRange();
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };

  const handleSelectAllOnPage = (checked: boolean) => {
    const requestsOnCurrentPage = categorizedRequests[activeTab as keyof typeof categorizedRequests].slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
    const actionableIdsOnPage = requestsOnCurrentPage.filter(r => {
      if (profile?.role === 'tutor') return r.status === 'pending';
      if (profile?.role === 'hod') return r.status === 'approved_by_tutor';
      if (profile?.role === 'admin') return r.status === 'approved_by_hod';
      return false;
    }).map(r => r.id);

    if (checked) {
      setSelectedIds(prev => [...new Set([...prev, ...actionableIdsOnPage])]);
    } else {
      setSelectedIds(prev => prev.filter(id => !actionableIdsOnPage.includes(id)));
    }
  };

  const requestsForCurrentTab = categorizedRequests[activeTab as keyof typeof categorizedRequests];
  const totalPagesForCurrentTab = Math.ceil(requestsForCurrentTab.length / ITEMS_PER_PAGE);
  const paginatedRequestsForCurrentTab = requestsForCurrentTab.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
              sortConfig={sortConfig}
              onSort={handleSort}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
              totalPages={totalPagesForCurrentTab}
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