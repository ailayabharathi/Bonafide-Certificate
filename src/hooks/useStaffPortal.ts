import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { SortConfig } from "@/types";
import { useLocation, useNavigate } from "react-router-dom";

export const useStaffPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State management for filters and UI
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState(location.state?.initialSearch || "");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState(location.state?.initialTab || "actionable");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });

  useEffect(() => {
    if (location.state?.initialSearch || location.state?.initialTab) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return {
    dateRange,
    onDateRangeChange: setDateRange,
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    departmentFilter,
    onDepartmentFilterChange: setDepartmentFilter,
    activeTab,
    onTabChange: setActiveTab,
    sortConfig,
    onSortChange: setSortConfig,
  };
};