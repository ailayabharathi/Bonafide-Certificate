import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useVerifyCertificatePageLogic } from "@/hooks/useVerifyCertificatePageLogic";

const VerifyCertificatePage = () => {
  const { loading, error, request } = useVerifyCertificatePageLogic();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <XCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Verification Failed</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      );
    }

    if (request && request.profiles) {
      return (
        <>
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300">
            <ShieldCheck className="h-5 w-5 text-current" />
            <AlertTitle className="text-lg font-bold text-current">Certificate Verified</AlertTitle>
            <AlertDescription className="text-current">
              This certificate is authentic and has been issued by Adhiyamaan College of Engineering.
            </AlertDescription>
          </Alert>
          <div className="space-y-4 mt-6 text-left border rounded-lg p-6">
            <div className="flex justify-between flex-wrap">
              <span className="text-muted-foreground">Student Name:</span>
              <span className="font-medium text-right">{request.profiles.first_name} {request.profiles.last_name}</span>
            </div>
            <div className="flex justify-between flex-wrap">
              <span className="text-muted-foreground">Register Number:</span>
              <span className="font-medium text-right">{request.profiles.register_number}</span>
            </div>
            <div className="flex justify-between flex-wrap">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium text-right">{request.profiles.department}</span>
            </div>
            <div className="flex justify-between flex-wrap">
              <span className="text-muted-foreground">Date Issued:</span>
              <span className="font-medium text-right">{new Date(request.updated_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between flex-wrap">
              <span className="text-muted-foreground">Certificate ID:</span>
              <span className="font-mono text-sm text-right">{request.id}</span>
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