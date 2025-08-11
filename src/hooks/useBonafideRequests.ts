import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BonafideRequest, BonafideRequestWithProfile, BonafideStatus, SortConfig } from "@/types";
import { useEffect, useState } from "react";
import { showError, showSuccess } from "@/utils/toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { exportToCsv } from "@/lib/utils";

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

const buildBonafideRequestQuery = (params: Omit<FetchRequestsParams, 'page'>) => {
  const { userId, startDate, endDate, searchQuery, statusFilter, sortConfig, departmentFilter } = params;

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

  return query;
};

const fetchRequests = async (params: FetchRequestsParams): Promise<{ data: BonafideRequestWithProfile[], count: number }> => {
  const { page } = params;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = buildBonafideRequestQuery(params);

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
  const [isExporting, setIsExporting] = useState(false);

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

  const exportData = async () => {
    setIsExporting(true);
    try {
      const query = buildBonafideRequestQuery(params);
      const { data: exportData, error } = await query;

      if (error) throw error;
      if (!exportData || exportData.length === 0) {
        showError("There is no data to export for the current filters.");
        return;
      }

      const flattenedData = (exportData as BonafideRequestWithProfile[]).map(request => ({
        id: request.id,
        student_name: `${request.profiles?.first_name || ''} ${request.profiles?.last_name || ''}`,
        register_number: request.profiles?.register_number || '',
        department: request.profiles?.department || '',
        reason: request.reason,
        status: request.status,
        rejection_reason: request.rejection_reason || '',
        submitted_at: new Date(request.created_at).toISOString(),
        last_updated_at: new Date(request.updated_at).toISOString(),
      }));

      exportToCsv(
        `bonafide-requests-${params.statusFilter || 'all'}-${new Date().toISOString().split('T')[0]}.csv`,
        flattenedData
      );
      showSuccess("Data exported successfully!");

    } catch (error: any) {
      showError(error.message || "An error occurred during the export.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    requests: data?.data || [],
    count: data?.count || 0,
    isLoading: isLoading && (!data?.data || data.data.length === 0),
    updateRequest: mutation.mutateAsync,
    bulkUpdateRequest: bulkUpdateMutation.mutateAsync,
    deleteRequest: deleteMutation.mutateAsync,
    exportData,
    isExporting,
  };
};