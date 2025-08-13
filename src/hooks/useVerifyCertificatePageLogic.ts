import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BonafideRequestWithProfile } from "@/types";

export const useVerifyCertificatePageLogic = () => {
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
          throw new Error("Certificate not found, expired, or invalid. Please check the ID and try again.");
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

  return {
    loading,
    error,
    request,
  };
};