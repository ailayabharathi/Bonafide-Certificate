import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApplyCertificateForm } from "@/components/ApplyCertificateForm";
import { StudentRequestsTable } from "@/components/StudentRequestsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { StatusDistributionChart } from "@/components/StatusDistributionChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExportButton } from "@/components/ExportButton";
import { useStudentPortalLogic } from "@/hooks/useStudentPortalLogic";

const StudentPortal = () => {
  const {
    user,
    isDialogOpen,
    setIsDialogOpen,
    requestToEdit,
    requests,
    isLoading,
    deleteRequest,
    stats,
    chartData,
    handleNewRequestClick,
    handleEditRequest,
  } = useStudentPortalLogic();

  const headerActions = (
    <div className="flex gap-2">
      <ExportButton
        data={requests.map(req => ({
          ...req,
          profiles: {
            first_name: user?.user_metadata.first_name,
            last_name: user?.user_metadata.last_name,
            department: user?.user_metadata.department,
            register_number: user?.user_metadata.register_number,
          }
        }))}
        filename={`my-bonafide-requests-${new Date().toISOString().split('T')[0]}.csv`}
      />
      <Button onClick={handleNewRequestClick}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Apply for Certificate
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Student Dashboard" headerActions={headerActions}>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader>
                <CardTitle>Requests History</CardTitle>
                <CardDescription>A log of all your bonafide certificate requests.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <StudentRequestsTable requests={requests} onEdit={handleEditRequest} onCancel={deleteRequest} />
              </CardContent>
            </Card>
            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
                <CardDescription>A breakdown of your request statuses.</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusDistributionChart data={chartData} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{requestToEdit ? 'Edit and Resubmit Request' : 'New Bonafide Certificate Request'}</DialogTitle>
            <DialogDescription>
              {requestToEdit ? 'Update the reason below and resubmit your request for approval.' : 'Fill out the form below to submit your request.'}
            </DialogDescription>
          </DialogHeader>
          <ApplyCertificateForm 
            onSuccess={() => setIsDialogOpen(false)} 
            setOpen={setIsDialogOpen}
            existingRequest={requestToEdit}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentPortal;