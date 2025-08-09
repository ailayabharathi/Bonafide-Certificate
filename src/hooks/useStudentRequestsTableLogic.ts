import { useState, useMemo } from "react";
import { BonafideRequest } from "@/types";
import { getStatusVariant, formatStatus } from "@/lib/utils"; // Import from utils

type SortableKey = keyof BonafideRequest;

const ITEMS_PER_PAGE = 10;

const isRejected = (status: BonafideRequest['status']) => 
  status === 'rejected_by_tutor' || status === 'rejected_by_hod';

export const useStudentRequestsTableLogic = (
  requests: BonafideRequest[],
  onCancel: (requestId: string) => Promise<void>
) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'descending' | 'ascending' }>({ key: 'created_at', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [requestToCancel, setRequestToCancel] = useState<BonafideRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleConfirmCancel = async () => {
    if (!requestToCancel) return;
    setIsCancelling(true);
    try {
      await onCancel(requestToCancel.id);
    } catch (error) {
      console.error("Failed to cancel request:", error);
    } finally {
      setIsCancelling(false);
      setRequestToCancel(null);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const processedRequests = useMemo(() => {
    let filteredRequests = [...requests];

    if (statusFilter !== "all") {
      filteredRequests = filteredRequests.filter(r => {
        if (statusFilter === 'in_progress') {
          return ['pending', 'approved_by_tutor', 'approved_by_hod'].includes(r.status);
        }
        if (statusFilter === 'completed') {
          return r.status === 'completed';
        }
        if (statusFilter === 'rejected') {
          return ['rejected_by_tutor', 'rejected_by_hod'].includes(r.status);
        }
        return r.status === statusFilter;
      });
    }

    if (searchQuery) {
      filteredRequests = filteredRequests.filter(r =>
        r.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filteredRequests.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return filteredRequests;
  }, [requests, sortConfig, statusFilter, searchQuery]);

  const totalPages = Math.ceil(processedRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = processedRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return {
    sortConfig,
    handleSort,
    currentPage,
    setCurrentPage,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    requestToCancel,
    setRequestToCancel,
    isCancelling,
    handleConfirmCancel,
    handleClearFilters,
    processedRequests,
    totalPages,
    paginatedRequests,
    getStatusVariant,
    formatStatus,
    isRejected,
    ITEMS_PER_PAGE,
  };
};