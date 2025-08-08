import { Link } from "react-router-dom";
import { UserNav } from "@/components/UserNav";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApplyCertificateForm } from "@/components/ApplyCertificateForm";
import { RequestsTable } from "@/components/RequestsTable";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BonafideRequest } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";

const StudentPortal = () => {
  const title = "Student Dashboard";
  const { user } = useAuth();
  const [requests, setRequests] = useState<BonafideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    // Keep loading state true only on initial fetch
    // Subsequent fetches from real-time updates shouldn't show a full loader
    if (requests.length === 0) {
        setLoading(true);
    }
    try {
      const { data, error } = await supabase
        .from("bonafide_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }, [user, requests.length]);

  useEffect(() => {
    if (user) {
      fetchRequests();

      const channel = supabase
        .channel(`student-requests:${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'bonafide_requests',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchRequests]);

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Apply for Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New Bonafide Certificate Request</DialogTitle>
                <DialogDescription>
                  Fill out the form below to submit your request.
                </DialogDescription>
              </DialogHeader>
              <ApplyCertificateForm onSuccess={() => {
                // No need to call fetchRequests here anymore, real-time will handle it
                setIsDialogOpen(false);
              }} setOpen={setIsDialogOpen} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Your Requests</h2>
            {loading ? (
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <RequestsTable requests={requests} />
            )}
        </div>
      </main>
    </div>
  );
};

export default StudentPortal;