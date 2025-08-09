import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Profile } from "@/contexts/AuthContext";

interface TabInfo {
  value: string;
  label: string;
  count: number;
}

interface StaffRequestsToolbarProps {
  tabs: TabInfo[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedIdsCount: number;
  onBulkAction: (type: 'approve' | 'reject') => void;
  onClearSelection: () => void;
  getApproveButtonText: () => string;
  profile: Profile | null;
}

export const StaffRequestsToolbar = ({
  tabs,
  searchQuery,
  onSearchChange,
  selectedIdsCount,
  onBulkAction,
  onClearSelection,
  getApproveButtonText,
  profile,
}: StaffRequestsToolbarProps) => {
  return (
    <div className="p-4 border-b space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label} ({tab.count})
            </TabsTrigger>
          ))}
        </TabsList>
        <Input
          placeholder="Search by student name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {selectedIdsCount > 0 && (
        <div className="flex items-center gap-4 p-2 bg-secondary rounded-md">
          <p className="text-sm font-medium">{selectedIdsCount} selected</p>
          <Button size="sm" onClick={() => onBulkAction('approve')}>{getApproveButtonText()} Selected</Button>
          {profile?.role !== 'admin' && <Button size="sm" variant="destructive" onClick={() => onBulkAction('reject')}>Reject Selected</Button>}
          <Button size="sm" variant="ghost" onClick={onClearSelection}>Clear selection</Button>
        </div>
      )}
    </div>
  );
};