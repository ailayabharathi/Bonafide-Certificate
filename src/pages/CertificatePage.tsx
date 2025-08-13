import { Link } from "react-router-dom";
import { Certificate } from "@/components/Certificate";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { useCertificatePageLogic } from "@/hooks/useCertificatePageLogic";

const CertificatePage = () => {
  const {
    request,
    loading,
    error,
    isDownloading,
    certificateRef,
    handleDownloadPDF,
  } = useCertificatePageLogic();

  if (loading) {
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
          <Link to="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 md:p-8 print:bg-white">
      <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center print:hidden">
        <Button variant="outline" asChild>
          <Link to="/">
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