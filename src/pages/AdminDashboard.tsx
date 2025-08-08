import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { StaffRequestsTable } from "@/components/StaffRequestsTable";
import { supabase } from "@/integrations/supabase/client";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { showError, showSuccess } from "@/utils/toast";
import { StatsCard } from "@/components/StatsCard";
import { ClipboardList, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";

const AdminDashboard = () => {
  const [requests, setRequests] = useState<BonafideRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (requests.length === 0) {
        setLoading(true);
    }
    try {
      const { data, error } = await supabase
        .from("bonafide_requests")
        .select("*, profiles(first_name, last_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data as BonafideRequestWithProfile[] || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      showError("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  }, [requests.length]);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('public:bonafide_requests:admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bonafide_requests' },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  const handleAction = async (requestId: string, newStatus: BonafideStatus, rejectionReason?: string) => {
    try {
      const { error } = await supabase
        .from("bonafide_requests")
        .update({ status: newStatus, rejection_reason: rejectionReason || null })
        .eq("id", requestId);

      if (error) throw error;
      showSuccess("Request updated successfully!");
    } catch (error: any) {
      showError(error.message || "Failed to update request.");
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'approved_by_hod').length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalRejected: requests.filter(r => ['rejected_by_tutor', 'rejected_by_hod'].includes(r.status)).length,
  };

  const headerActions = (
    <Link to="/admin/user-management">
      <Button variant="outline">
        <Users className="mr-2 h-4 w-4" />
        Manage Users
      </Button>
    </Link>
  );

  return (
    <DashboardLayout title="Admin Dashboard" headerActions={headerActions}>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard title="Total Requests" value={stats.total} icon={ClipboardList} />
              <StatsCard title="Pending Final Processing" value={stats.pending} icon={Clock} />
              <StatsCard title="Completed Certificates" value={stats.completed} icon={CheckCircle} />
              <StatsCard title="Total Rejected" value={stats.totalRejected} icon={XCircle} />
          </div>
          <StaffRequestsTable
            requests={requests}
            onAction={handleAction}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;