import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { useEffect } from "react";
import { showError, showSuccess } from "@/utils/toast";

const fetchRequests = async (): Promise<BonafideRequestWithProfile[]> => {
  const { data, error } = await supabase
    .from("bonafide_requests")
    .select("*, profiles(first_name, last_name)")
    .order("created_at", { ascending: false });

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

export const useBonafideRequests = (channelName: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["bonafide_requests"];

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bonafide_requests" },
        () => {
          queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, channelName, queryKey]);

  const { data: requests, isLoading } = useQuery<BonafideRequestWithProfile[]>({
    queryKey,
    queryFn: fetchRequests,
    initialData: [],
  });

  const mutation = useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: () => {
      showSuccess("Request updated successfully!");
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    requests: requests || [],
    isLoading: isLoading && (!requests || requests.length === 0),
    updateRequest: mutation.mutateAsync,
  };
};