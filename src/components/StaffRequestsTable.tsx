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
  const [departmentFilter, setDepartmentFilter] = useState("all"); // New state for department filter
  const [activeTab, setActiveTab] = useState("actionable");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'descending' | 'ascending' }>({ key: 'created_at', direction: 'descending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const ITEMS_PER_PAGE = 10;

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [studentUserIdToView, setStudentUserIdToView] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [activeTab, searchQuery, departmentFilter, sortConfig]); // Add departmentFilter to dependencies

  const handleSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const openDialog = (type: 'approve' | 'reject' | 'revert', bulk: boolean, request?: BonafideRequestWithProfile) => {
    setActionType(type);
    setIsBulk(bulk);
    setActionRequest(request || null);
  };

  const closeDialog = () => {
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
    closeDialog();
  };

  const handleViewProfile = (userId: string) => {
    setStudentUserIdToView(userId);
    setIsProfileDialogOpen(true);
  };

  const getActionability = (status: BonafideStatus) => {
    if (profile?.role === 'tutor') return status === 'pending';
    if (profile?.role === 'hod') return status === 'approved_by_tutor';
    if (profile?.role === 'admin') return status === 'approved_by_hod';
    return false;
  };
  
  const getApproveButtonText = () => {
      if (profile?.role === 'admin') return 'Mark as Completed';
      return 'Approve';
  }

  const uniqueDepartments = useMemo(() => {
    const departments = new Set<string>();
    requests.forEach(req => {
        if (req.profiles?.department) {
            departments.add(req.profiles.department);
        }
    });
    return Array.from(departments).sort();
  }, [requests]);

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
  }, [requests, searchQuery, departmentFilter, sortConfig]); // Add departmentFilter to dependencies

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

  const SortableHeader = ({ columnKey, title }: { columnKey: SortableKey, title: string }) => {
    const isSorted = sortConfig.key === columnKey;
    return (
      <TableHead>
        <Button variant="ghost" onClick={() => handleSort(columnKey)}>
          {title}
          {isSorted ? (
            sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />
          )}
        </Button>
      </TableHead>
    );
  };

  const renderTable = (requestsToRender: BonafideRequestWithProfile[]) => {
    const totalItems = requestsToRender.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginatedRequests = requestsToRender.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

    const actionableIdsOnPage = paginatedRequests.filter(r => getActionability(r.status)).map(r => r.id);
    const numSelectedOnPage = selectedIds.filter(id => actionableIdsOnPage.includes(id)).length;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...new Set([...prev, ...actionableIdsOnPage])]);
        } else {
            setSelectedIds(prev => prev.filter(id => !actionableIdsOnPage.includes(id)));
        }
    };

    if (requestsToRender.length === 0) {
      return (
        <div className="flex items-center justify-center h-24 p-4">
          <p className="text-muted-foreground">No requests in this category.</p>
        </div>
      );
    }
    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    actionableIdsOnPage.length > 0 && numSelectedOnPage === actionableIdsOnPage.length
                      ? true
                      : numSelectedOnPage > 0 && numSelectedOnPage < actionableIdsOnPage.length
                      ? "indeterminate"
                      : false
                  }
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all on page"
                  disabled={actionableIdsOnPage.length === 0}
                />
              </TableHead>
              <SortableHeader columnKey="studentName" title="Student Name" />
              <TableHead>Register No.</TableHead>
              <TableHead>Department</TableHead>
              <SortableHeader columnKey="created_at" title="Submitted" />
              <TableHead>Reason</TableHead>
              <SortableHeader columnKey="status" title="Status" />
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.map((request) => (
              <TableRow key={request.id} data-state={selectedIds.includes(request.id) ? "selected" : undefined}>
                <TableCell className="w-12">
                  <Checkbox
                    checked={selectedIds.includes(request.id)}
                    onCheckedChange={(checked) => {
                      setSelectedIds(prev => checked ? [...prev, request.id] : prev.filter(id => id !== request.id))
                    }}
                    aria-label={`Select request ${request.id}`}
                    disabled={!getActionability(request.status)}
                  />
                </TableCell>
                <TableCell>{request.profiles?.first_name} {request.profiles?.last_name}</TableCell>
                <TableCell>{request.profiles?.register_number}</TableCell>
                <TableCell>{request.profiles?.department}</TableCell>
                <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <Badge variant={getStatusVariant(request.status)} className={cn(request.status === 'completed' && 'bg-green-500 text-white')}>
                      {formatStatus(request.status)}
                    </Badge>
                    {request.rejection_reason && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-destructive max-w-[200px] truncate cursor-help">
                              Reason: {request.rejection_reason}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{request.rejection_reason}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {request.profiles && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => handleViewProfile(request.user_id)}>
                              <User className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Student Profile</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {request.status === 'completed' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/certificate/${request.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Certificate</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {getActionability(request.status) ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => openDialog('approve', false, request)}>{getApproveButtonText()}</Button>
                        {profile?.role !== 'admin' && <Button size="sm" variant="destructive" onClick={() => openDialog('reject', false, request)}>Reject</Button>}
                      </>
                    ) : profile?.role === 'admin' && request.status === 'completed' ? (
                      <Button size="sm" variant="secondary" onClick={() => openDialog('revert', false, request)}>Revert</Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">No action needed</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages || 1}
            </div>
            <div className="space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
      </>
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("all"); // Clear department filter
    setActiveTab("actionable");
    setSelectedIds([]);
    onClearDateRange();
  };

  return (
    <div className="border rounded-md bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <StaffRequestsToolbar
          tabs={tabsInfo}
          activeTab={activeTab}
          requestsForExport={categorizedRequests[activeTab as keyof typeof categorizedRequests]}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          departmentFilter={departmentFilter} // Pass department filter
          onDepartmentFilterChange={setDepartmentFilter} // Pass department filter handler
          departments={uniqueDepartments} // Pass unique departments
          selectedIdsCount={selectedIds.length}
          onBulkAction={(type) => openDialog(type, true)}
          onClearSelection={() => setSelectedIds([])}
          getApproveButtonText={getApproveButtonText}
          profile={profile}
          onClearFilters={handleClearFilters}
        />
        {tabsInfo.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="m-0">
            {renderTable(categorizedRequests[tab.value as keyof typeof categorizedRequests])}
          </TabsContent>
        ))}
      </Tabs>

      <RequestActionDialog
        isOpen={!!actionType}
        onOpenChange={(open) => !open && closeDialog()}
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