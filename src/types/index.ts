export type BonafideStatus = 
  | 'pending'
  | 'approved_by_tutor'
  | 'rejected_by_tutor'
  | 'approved_by_hod'
  | 'rejected_by_hod'
  | 'completed';

export interface BonafideRequest {
  id: string;
  user_id: string;
  reason: string;
  status: BonafideStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BonafideRequestWithProfile extends BonafideRequest {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    department?: string | null;
    register_number?: string | null;
  } | null;
}

// Represents a user in the user management context
export interface ManagedUser {
  id: string;
  email?: string;
  role: 'student' | 'tutor' | 'hod' | 'admin';
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  department?: string | null;
  register_number?: string | null;
  created_at: string;
  tutor_id?: string | null;
}

// New ColumnDef interface for generic DataTable
export interface ColumnDef<TData> {
  id: string;
  header: string | ((props: { sortConfig: SortConfig; onSort: (key: string) => void }) => React.ReactNode);
  cell: (props: { row: TData }) => React.ReactNode;
  enableSorting?: boolean;
  className?: string;
}

// New SortConfig interface for generic DataTable
export interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}