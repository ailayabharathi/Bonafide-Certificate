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