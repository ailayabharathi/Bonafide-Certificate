import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BonafideRequestWithProfile } from "@/types";
import { Certificate } from "@/components/Certificate";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { showError } from "@/utils/toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CertificatePage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<BonafideRequestWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

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
          .select("*, profiles(first_name, last_name, department, register_number)")
          .eq("id", requestId)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          throw new Error("Certificate not found.");
        }

        if (data.user_id !== user.id) {
          throw new Error("You are not authorized to view this certificate.");
        }
        
        if (data.status !== 'completed') {
            throw new Error("This certificate has not been approved and issued yet.");
        }

        setRequest(data as BonafideRequestWithProfile);
      } catch (err: any) => {
        setError(err.message || "An error occurred while fetching the certificate.");
        showError(err.message || "Failed to fetch certificate.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [requestId, user, authLoading, navigate]);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !request?.profiles) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { 
        scale: 3, // Increase scale for better resolution
        useCORS: true,
        backgroundColor: null, // Use transparent background
      });
      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm: 210 x 297.
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      
      // Calculate image dimensions to fit A4, maintaining aspect ratio
      const imgWidth = pdfWidth - 20; // with 10mm margin on each side
      const imgHeight = imgWidth / canvasAspectRatio;

      const x = 10; // 10mm margin from left
      const y = (pdfHeight - imgHeight) / 2; // Center vertically

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`Bonafide_Certificate_${request.profiles.first_name || 'Student'}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      showError("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
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
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 md:p-8 print:bg-white">
      <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center print:hidden">
        <Button variant="outline" asChild>
          <Link to="/student/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button onClick={handleDownloadPDF} disabled={isDownloading}>
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>
      <div ref={certificateRef}>
        {request && <Certificate request={request} />}
      </div>
    </div>
  );
};

export default CertificatePage;