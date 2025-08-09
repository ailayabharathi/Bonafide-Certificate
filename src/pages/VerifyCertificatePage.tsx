import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BonafideRequestWithProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MadeWithDyad } from "@/components/made-with-dyad";

const VerifyCertificatePage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const [request, setRequest] = useState<BonafideRequestWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!requestId) {
        setError("No Certificate ID provided.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("bonafide_requests")
          .select("*, profiles(first_name, last_name, department, register_number)")
          .eq("id", requestId)
          .eq("status", "completed") // Only show completed certificates
          .single();

        if (fetchError || !data) {
          throw new Error("Certificate not found, expired, or invalid.");
        }

        setRequest(data as BonafideRequestWithProfile);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [requestId]);

  const renderContent = () => {
    if (loading) {
      return <Skeleton className="h-64 w-full" />;
    }

    if (error) {
      return (
        <div className="text-center text-destructive">
          <XCircle className="mx-auto h-12 w-12 mb-4" />
          <p className="text-xl font-semibold">Verification Failed</p>
          <p>{error}</p>
        </div>
      );
    }

    if (request && request.profiles) {
      return (
        <>
          <div className="text-center text-green-600 dark:text-green-500">
            <ShieldCheck className="mx-auto h-12 w-12 mb-4" />
            <p className="text-xl font-semibold">Certificate Verified</p>
          </div>
          <div className="space-y-4 mt-6 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student Name:</span>
              <span className="font-medium">{request.profiles.first_name} {request.profiles.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Register Number:</span>
              <span className="font-medium">{request.profiles.register_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium">{request.profiles.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date Issued:</span>
              <span className="font-medium">{new Date(request.updated_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Certificate ID:</span>
              <span className="font-mono text-sm">{request.id}</span>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Bonafide Certificate Verification</CardTitle>
            <CardDescription>This page confirms the authenticity of a certificate issued by our institution.</CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </main>
      <Footer />
      <MadeWithDyad />
    </div>
  );
};

export default VerifyCertificatePage;