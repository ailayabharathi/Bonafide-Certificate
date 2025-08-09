import { useState, useCallback } from "react";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { Profile } from "@/contexts/AuthContext";
import { showSuccess } from "@/utils/toast";

interface UseStaffRequestsTableActionsProps {
  profile: Profile | null;
  onAction: (requestId: string, newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
  onBulkAction: (requestIds: string[], newStatus: BonafideStatus, rejectionReason?: string) => Promise<void>;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}

export const useStaffRequestsTableActions = ({
  profile,
  onAction,
  onBulkAction,
  selectedIds,
  setSelectedIds,
}: UseStaffRequestsTableActionsProps) => {
  const [actionRequest, setActionRequest] = useState<BonafideRequestWithProfile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revert' | null>(null);
  const [isBulk, setIsBulk] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [studentUserIdToView, setStudentUserIdToView] = useState<string | null>(null);

  const openActionDialog = useCallback((type: 'approve' | 'reject' | 'revert', bulk: boolean, request?: BonafideRequestWithProfile) => {
    setActionType(type);
    setIsBulk(bulk);
    setActionRequest(request || null);
  }, []);

  const closeActionDialog = useCallback(() => {
    setActionRequest(null);
    setActionType(null);
    setIsBulk(false);
  }, []);

  const handleConfirmAction = useCallback(async (rejectionReason?: string) => {
    if (!actionType || !profile) return;
    if (!isBulk && !actionRequest) return;
    if (isBulk && selectedIds.length === 0) return;

    setIsSubmitting(true);
    let newStatus: BonafideStatus;

    if (actionType === 'approve') {
      if (profile.role === 'tutor') newStatus = 'approved_by_tutor';
      else if (profile.role === 'hod') newStatus = 'approved_by_hod';
      else if (profile.role === 'admin') newStatus = 'completed';
      else return;
    } else if (actionType === 'revert') {
        if (profile.role !== 'admin') return;
        newStatus = 'approved_by_hod';
    } else { // reject
      if (profile.role === 'tutor') newStatus = 'rejected_by_tutor';
      else if (profile.role === 'hod') newStatus = 'rejected_by_hod';
      else return;
    }

    if (isBulk) {
      await onBulkAction(selectedIds, newStatus, rejectionReason);
      setSelectedIds([]);
    } else if (actionRequest) {
      await onAction(actionRequest.id, newStatus, rejectionReason);
    }

    setIsSubmitting(false);
    closeActionDialog();
  }, [actionType, profile, isBulk, actionRequest, selectedIds, onBulkAction, onAction, setSelectedIds, closeActionDialog]);

  const handleViewProfile = useCallback((userId: string) => {
    setStudentUserIdToView(userId);
    setIsProfileDialogOpen(true);
  }, []);
  
  const getApproveButtonText = useCallback(() => {
      if (profile?.role === 'admin') return 'Mark as Completed';
      return 'Approve';
  }, [profile]);

  return {
    actionRequest,
    actionType,
    isBulk,
    isSubmitting,
    isProfileDialogOpen,
    studentUserIdToView,
    openActionDialog,
    closeActionDialog,
    handleConfirmAction,
    handleViewProfile,
    getApproveButtonText,
    setIsProfileDialogOpen, // Expose setter for dialog control
  };
};