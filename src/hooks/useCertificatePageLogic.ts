import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BonafideRequestWithProfile } from '@/types';
import { showError } from '@/utils/toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const useCertificatePageLogic = () => {
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

      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from("bonafide_requests")
          .select("*, profiles(first_name, last_name, department, register_number)")
          .eq("id", requestId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("Certificate not found.");

        // Allow admin/hod/tutor to view any certificate for verification purposes
        const userIsStaff = ['admin', 'hod', 'tutor'].includes(user.app_metadata.role);
        if (data.user_id !== user.id && !userIsStaff) {
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

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !request?.profiles) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { 
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      
      const imgWidth = pdfWidth - 20;
      const imgHeight = imgWidth / canvasAspectRatio;

      const x = 10;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`Bonafide_Certificate_${request.profiles.first_name || 'Student'}.pdf`);
    } catch (err: any) {
      console.error("Error generating PDF:", err);
      showError("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    request,
    loading: loading || authLoading,
    error,
    isDownloading,
    certificateRef,
    handleDownloadPDF,
  };
};