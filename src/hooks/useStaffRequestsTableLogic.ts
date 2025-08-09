import { useState, useMemo, useEffect } from "react";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { Profile } from "@/contexts/AuthContext";
import { departments } from "@/lib/departments";

type SortableKey = keyof BonafideRequestWithProfile | 'studentName';

interface TabInfo {
  value: string;
  label: string;
  count: number;
}

const ITEMS_PER_PAGE = 10;

export const useStaffRequestsTableLogic = (
  requests: BonafideRequestWithProfile[],
  profile: Profile | null,
  onClearDateRange: () => void
) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("actionable");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'descending' | 'ascending' }>({ key: 'created_at', direction: 'descending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const getActionability = (status: BonafideStatus) => {
    if (profile?.role === 'tutor') return status === 'pending';
    if (profile?.role === 'hod') return status === 'approved_by_tutor';
    if (profile?.role === 'admin') return status === 'approved_by_hod';
    return false;
  };

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

  const requestsForCurrentTab = categorizedRequests[activeTab as keyof typeof categorizedRequests];
  const totalPagesForCurrentTab = Math.ceil(requestsForCurrentTab.length / ITEMS_PER_PAGE);
  const paginatedRequestsForCurrentTab = requestsForCurrentTab.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const actionableIdsOnPage = useMemo(() => 
    paginatedRequestsForCurrentTab.filter(r => getActionability(r.status)).map(r => r.id),
    [paginatedRequestsForCurrentTab, profile]
  );

  const handleSelectAllOnPage = (checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...new Set([...prev, ...actionableIdsOnPage])]);
    } else {
      setSelectedIds(prev => prev.filter(id => !actionableIdsOnPage.includes(id)));
    }
  };

  return {
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
    getActionability, // Keep this for internal use in the hook if needed, or remove if only actionableIdsOnPage is exposed
    actionableIdsOnPage, // Expose this
    ITEMS_PER_PAGE,
  };
};