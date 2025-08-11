import { useState, useMemo } from "react";
import { BonafideRequest, SortConfig } from "@/types";
import { Profile } from "@/contexts/AuthContext";
import { showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { DateRange } from "react-day-picker";

export const useStaffPortalLogic = (role: Profile['role']) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("actionable");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });

  const statusFilter = useMemo(() => {
    if (activeTab === 'actionable') {
      if (role === 'tutor') return 'pending';
      if (role === 'hod') return 'approved_by_tutor';
      if (role === 'admin') return 'approved_by_hod';
    }
    return activeTab;
  }, [activeTab, role]);

  const handleRealtimeEvent = (payload: RealtimePostgresChangesPayload<BonafideRequest>) => {
    if (payload.eventType !== 'UPDATE' && payload.eventType !== 'INSERT') return;

    const newStatus = payload.new.status;
    let message = "";

    if (role === 'tutor' && newStatus === 'pending' && payload.eventType === 'INSERT') {
      message = "New request received for your review.";
    } else if (role === 'hod' && newStatus === 'approved_by_tutor') {
      message = "A request requires your approval.";
    } else if (role === 'admin' && newStatus === 'approved_by_hod') {
      message = "A request is ready for final processing.";
    }

    if (message) {
      showSuccess(message);
    }
  };

  return {
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,
    activeTab,
    setActiveTab,
    sortConfig,
    setSortConfig,
    statusFilter,
    handleRealtimeEvent,
  };
};