import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BonafideRequestWithProfile } from "@/types";
import { Certificate } from "@/components/Certificate";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, ArrowLeft } from "lucide-react";
import { showError } from "@/utils/toast";

const CertificatePage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<BonafideRequestWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCertificate = async () => {
      if (!requestId) {
        setError("Request ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("bonafide_requests")
          .select("*, profiles(first_name, last_name)")
          .eq("id", requestId)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          throw new Error("Certificate not found.");
        }

        // Authorization check
        if (data.user_id !== user.id) {
          throw new Error("You are not authorized to view this certificate.");
        }
        
        if (data.status !== 'completed') {
            throw new Error("This certificate has not been approved and issued yet.");
        }

        setRequest(data as BonafideRequestWithProfile);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching the certificate.");
        showError(err.message || "Failed to fetch certificate.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [requestId, user, authLoading, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || authLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-[800px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-2xl font-bold text-destructive mb-4">Error</p>
        <p className="text-red-600 mb-8">{error}</p>
        <Button asChild>
          <Link to="/student/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center print:hidden">
        <Button variant="outline" asChild>
          <Link to="/student/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Certificate
        </Button>
      </div>
      {request && <Certificate request={request} />}
    </div>
  );
};

export default CertificatePage;