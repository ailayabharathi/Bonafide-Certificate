import { useState } from "react";
import { DateRange } from "react-day-picker";
import { SortConfig } from "@/types";

export const useStaffPortal = () => {
  // State management for filters and UI
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("actionable");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'descending' });

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