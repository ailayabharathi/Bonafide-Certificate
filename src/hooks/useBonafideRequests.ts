import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BonafideRequest, BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { useEffect } from "react";
import { showError, showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

const fetchRequests = async (userId?: string): Promise<BonafideRequestWithProfile[]> => {
  let query = supabase
    .from("bonafide_requests")
    .select("*, profiles(first_name, last_name, department, register_number)")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    showError("Failed to fetch requests.");
    throw new Error(error.message);
  }
  return (data as BonafideRequestWithProfile[]) || [];
};

const updateRequestStatus = async ({
  requestId,
  newStatus,
  rejectionReason,
}: {
  requestId: string;
  newStatus: BonafideStatus;
  rejectionReason?: string;
}) => {
  const { error } = await supabase
    .from("bonafide_requests")
    .update({ status: newStatus, rejection_reason: rejectionReason || null })
    .eq("id", requestId);

  if (error) {
    showError(error.message || "Failed to update request.");
    throw new Error(error.message);
  }
};

const bulkUpdateRequestStatus = async ({
  requestIds,
  newStatus,
  rejectionReason,
}: {
  requestIds: string[];
  newStatus: BonafideStatus;
  rejectionReason?: string;
}) => {
    const updates = requestIds.map(id => 
        supabase
            .from("bonafide_requests")
            .update({ status: newStatus, rejection_reason: rejectionReason || null })
            .eq("id", id)
    );

    const results = await Promise.all(updates);
    const firstError = results.find(res => res.error);

    if (firstError?.error) {
        showError(firstError.error.message || "An error occurred during bulk update.");
        throw new Error(firstError.error.message);
    }
};

const deleteRequest = async (requestId: string) => {
  const { error } = await supabase
    .from("bonafide_requests")
    .delete()
    .eq("id", requestId);

  if (error) {
    showError(error.message || "Failed to cancel request.");
    throw new Error(error.message);
  }
};

const invokeEmailNotification = async (requestId: string) => {
  try {
    const { error } = await supabase.functions.invoke('send-status-update-email', {
      body: { requestId },
    });
    if (error) throw error;
  } catch (error) {
    // Log the error but don't block the UI flow or show an error toast
    console.error("Failed to send email notification:", error);
  }
};

export const useBonafideRequests = (
  channelName: string,
  userId?: string,
  onRealtimeEvent?: (payload: RealtimePostgresChangesPayload<BonafideRequest>) => void
) => {
  const queryClient = useQueryClient();
  const queryKey = ["bonafide_requests", userId || "all"];

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on<BonafideRequest>(
        "postgres_changes",
        { event: "*", schema: "public", table: "bonafide_requests" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey });
          onRealtimeEvent?.(payload);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, channelName, queryKey, onRealtimeEvent]);

  const { data: requests, isLoading } = useQuery<BonafideRequestWithProfile[]>({
    queryKey,
    queryFn: () => fetchRequests(userId),
    initialData: [],
  });

  const mutation = useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: (data, variables) => {
      showSuccess("Request updated successfully!");
      queryClient.invalidateQueries({ queryKey });
      invokeEmailNotification(variables.requestId);
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: bulkUpdateRequestStatus,
    onSuccess: (data, variables) => {
        showSuccess(`${variables.requestIds.length} requests updated successfully!`);
        queryClient.invalidateQueries({ queryKey });
        variables.requestIds.forEach(requestId => {
          invokeEmailNotification(requestId);
        });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      showSuccess("Request cancelled successfully!");
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    requests: requests || [],
    isLoading: isLoading && (!requests || requests.length === 0),
    updateRequest: mutation.mutateAsync,
    bulkUpdateRequest: bulkUpdateMutation.mutateAsync,
    deleteRequest: deleteMutation.mutateAsync,
  };
};