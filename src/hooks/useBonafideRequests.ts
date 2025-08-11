import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BonafideRequest, BonafideRequestWithProfile, BonafideStatus, SortConfig } from "@/types";
import { useEffect } from "react";
import { showError, showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

const ITEMS_PER_PAGE = 10;

interface FetchRequestsParams {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
  statusFilter?: string;
  sortConfig?: SortConfig;
  departmentFilter?: string;
  page: number;
}

const fetchRequests = async (params: FetchRequestsParams): Promise<{ data: BonafideRequestWithProfile[], count: number }> => {
  const { userId, startDate, endDate, searchQuery, statusFilter, sortConfig, departmentFilter, page } = params;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from("bonafide_requests")
    .select("*, profiles!inner(first_name, last_name, department, register_number)", { count: 'exact' });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString());
  }
  if (endDate) {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    query = query.lt("created_at", adjustedEndDate.toISOString());
  }

  if (searchQuery) {
    if (userId) {
      query = query.ilike('reason', `%${searchQuery}%`);
    } else {
      query = query.or(`reason.ilike.%${searchQuery}%,profiles.first_name.ilike.%${searchQuery}%,profiles.last_name.ilike.%${searchQuery}%,profiles.register_number.ilike.%${searchQuery}%`);
    }
  }

  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'in_progress') {
      query = query.in('status', ['pending', 'approved_by_tutor', 'approved_by_hod']);
    } else if (statusFilter === 'rejected') {
      query = query.in('status', ['rejected_by_tutor', 'rejected_by_hod']);
    } else {
      query = query.eq('status', statusFilter as BonafideStatus);
    }
  }
  
  if (departmentFilter && departmentFilter !== 'all') {
    query = query.eq('profiles.department', departmentFilter);
  }

  if (sortConfig && sortConfig.key) {
    const isProfileSort = ['studentName', 'department', 'register_number'].includes(sortConfig.key);
    const sortKey = sortConfig.key === 'studentName' ? 'first_name' : sortConfig.key;
    
    if (isProfileSort) {
      query = query.order(sortKey, { foreignTable: 'profiles', ascending: sortConfig.direction === 'ascending' });
    } else {
      query = query.order(sortKey, { ascending: sortConfig.direction === 'ascending' });
    }
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    showError("Failed to fetch requests.");
    throw new Error(error.message);
  }
  return { data: (data as BonafideRequestWithProfile[]) || [], count: count ?? 0 };
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

export const useBonafideRequests = (
  channelName: string,
  params: FetchRequestsParams,
  onRealtimeEvent?: (payload: RealtimePostgresChangesPayload<BonafideRequest>) => void,
) => {
  const queryClient = useQueryClient();
  const queryKey = ["bonafide_requests", params];

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on<BonafideRequest>(
        "postgres_changes",
        { event: "*", schema: "public", table: "bonafide_requests" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["bonafide_requests"] });
          onRealtimeEvent?.(payload);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, channelName, onRealtimeEvent, queryKey]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchRequests(params),
  });

  const mutation = useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: () => {
      showSuccess("Request updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["bonafide_requests"] });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: bulkUpdateRequestStatus,
    onSuccess: (data, variables) => {
        showSuccess(`${variables.requestIds.length} requests updated successfully!`);
        queryClient.invalidateQueries({ queryKey: ["bonafide_requests"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      showSuccess("Request cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ["bonafide_requests"] });
    },
  });

  return {
    requests: data?.data || [],
    count: data?.count || 0,
    isLoading: isLoading && (!data?.data || data.data.length === 0),
    updateRequest: mutation.mutateAsync,
    bulkUpdateRequest: bulkUpdateMutation.mutateAsync,
    deleteRequest: deleteMutation.mutateAsync,
  };
};