import { useState, useMemo, useEffect } from "react";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { Profile } from "@/contexts/AuthContext";

const ITEMS_PER_PAGE = 10;

export const useStaffRequestsTableLogic = (
  requests: BonafideRequestWithProfile[],
  profile: Profile | null
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Reset page and selection when the underlying data changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [requests]);

  const getActionability = (status: BonafideStatus) => {
    if (profile?.role === 'tutor') return status === 'pending';
    if (profile?.role === 'hod') return status === 'approved_by_tutor';
    if (profile?.role === 'admin') return status === 'approved_by_hod';
    return false;
  };

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const actionableIdsOnPage = useMemo(() => 
    paginatedRequests.filter(r => getActionability(r.status)).map(r => r.id),
    [paginatedRequests, profile]
  );

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };

  const handleSelectAllOnPage = (checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...new Set([...prev, ...actionableIdsOnPage])]);
    } else {
      setSelectedIds(prev => prev.filter(id => !actionableIdsOnPage.includes(id)));
    }
  };

  return {
    currentPage,
    setCurrentPage,
    selectedIds,
    setSelectedIds,
    handleToggleSelect,
    handleSelectAllOnPage,
    paginatedRequests,
    totalPages,
    actionableIdsOnPage,
  };
};