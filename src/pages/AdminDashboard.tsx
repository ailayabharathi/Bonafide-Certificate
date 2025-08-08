import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserNav } from "@/components/UserNav";
import { StaffRequestsTable } from "@/components/StaffRequestsTable";
import { supabase } from "@/integrations/supabase/client";
import { BonafideRequestWithProfile, BonafideStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { showError, showSuccess } from "@/utils/toast";
import { StatsCard } from "@/components/StatsCard";
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";

const AdminDashboard = () => {
  const title = "Admin Dashboard";
  const [requests, setRequests] = useState<BonafideRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: string, newStatus: BonafideStatus, rejectionReason?: string) => {
    try {
      const { error } = await supabase
        .from("bonafide_requests")
        .update({ status: newStatus, rejection_reason: rejectionReason || null })
        .eq("id", requestId);

      if (error) throw error;
      showSuccess("Request updated successfully!");
      fetchRequests();
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

  const pendingFinalApproval = requests.filter(r => r.status === 'approved_by_hod');
  const otherRequests = requests.filter(r => r.status !== 'approved_by_hod');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
               <img src="/placeholder.svg" alt="College Logo" className="h-8 w-8" />
              <span className="inline-block font-bold">ACE Portal</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <UserNav />
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{title}</h1>
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Requests" value={stats.total} icon={ClipboardList} />
                <StatsCard title="Pending Final Processing" value={stats.pending} icon={Clock} />
                <StatsCard title="Completed Certificates" value={stats.completed} icon={CheckCircle} />
                <StatsC<ctrl63>ard title="Total Rejected" value={stats.totalRejected} icon={XCircle} />
            </div>
            <StaffRequestsTable
              requests={pendingFinalApproval}
              title="Ready for Final Processing"
              onAction={handleAction}
            />
            <StaffRequestsTable
              requests={otherRequests}
              title="All Other Requests"
              onAction={handleAction}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;