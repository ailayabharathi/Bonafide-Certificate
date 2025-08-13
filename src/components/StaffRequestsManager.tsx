import { useMemo, useCallback } from "react";
import { BonafideRequestWithProfile, SortConfig } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { getStaffTableColumns } from "@/lib/staff-table-columns";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/DataTable";
import { StaffRequestsToolbar } from "./StaffRequestsToolbar";

interface StaffRequestsManagerProps {
  tabsInfo: { value: string; label: string; count: number }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (filter: string) => void;
  handleClearFilters: () => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  requests: BonafideRequestWithProfile[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  selectableRowIds: string[];
  openActionDialog: (type: 'approve' | 'reject' | 'revert', bulk: boolean, request?: BonafideRequestWithProfile) => void;
  handleViewProfile: (userId: string) => void;
  isExporting: boolean;
  handleExport: () => void;
  isLoading: boolean;
}

export function StaffRequestsManager({ 
  tabsInfo,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentFilterChange,
  handleClearFilters,
  sortConfig,
  onSortChange,
  requests,
  currentPage,
  totalPages,
  onPageChange,
  selectedIds,
  setSelectedIds,
  selectableRowIds,
  openActionDialog,
  handleViewProfile,
  isExporting,
  handleExport,
  isLoading,
}: StaffRequestsManagerProps) {
  const { profile } = useAuth();

  const isRowSelectable = useCallback((request: BonafideRequestWithProfile) => {
    if (profile?.role === 'tutor') return request.status === 'pending';
    if (profile?.role === 'hod') return request.status === 'approved_by_tutor';
    if (profile?.role === 'admin') return request.status === 'approved_by_hod';
    return false;
  }, [profile]);

  const selectableRowIdsOnPage = useMemo(() => 
    requests.filter(isRowSelectable).map(r => r.id),
    [requests, isRowSelectable]
  );

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(checked ? [...selectedIds, id] : selectedIds.filter(item => item !== id));
  };

  const handleSelectAllOnPage = (checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...new Set([...prev, ...selectableRowIdsOnPage])]);
    } else {
      setSelectedIds(prev => prev.filter(id => !selectableRowIdsOnPage.includes(id)));
    }
  };

  const columns = useMemo(() => getStaffTableColumns({
    profile,
    onViewProfile: handleViewProfile,
    onOpenActionDialog: openActionDialog,
  }), [profile, handleViewProfile, openActionDialog]);

  return (
    <div className="border rounded-md bg-background">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <StaffRequestsToolbar
          tabs={tabsInfo}
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={onDepartmentFilterChange}
          selectedIdsCount={selectedIds.length}
          onBulkAction={(type) => openActionDialog(type, true)}
          onClearSelection={() => setSelectedIds([])}
          profile={profile}
          onClearFilters={handleClearFilters}
          onExport={handleExport}
          isExporting={isExporting}
        />
        {tabsInfo.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="m-0">
            <DataTable
              columns={columns}
              data={requests}
              sortConfig={sortConfig as { key: string; direction: 'ascending' | 'descending' }}
              onSort={(key) => onSortChange({ key, direction: sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending' })}
              currentPage={currentPage}
              onPageChange={onPageChange}
              totalPages={totalPages}
              enableRowSelection={true}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAllOnPage}
              selectableRowIds={selectableRowIdsOnPage}
              rowKey={(row) => row.id}
              isLoading={isLoading}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}