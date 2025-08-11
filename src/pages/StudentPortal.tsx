import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApplyCertificateForm } from "@/components/ApplyCertificateForm";
import { StudentRequestsTable } from "@/components/StudentRequestsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { StatusDistributionChart } from "@/components/StatusDistributionChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExportButton } from "@/components/ExportButton";
import { useStudentPortalLogic } from "@/hooks/useStudentPortalLogic";

const StudentPortal = () => {
  const {
    isApplyDialogOpen,
    setIsApplyDialogOpen,
    requestToEdit,
    requestToCancel,
    setRequestToCancel,
    isCancelling,
    dashboardData,
    handleNewRequestClick,
    handleEditRequest,
    handleConfirmCancel,
    handleClearFilters,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
    requests,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
  } = useStudentPortalLogic();

  const headerActions = (
    <div className="flex gap-2">
      <ExportButton
        data={requests}
        filename={`my-bonafide-requests-${new Date().toISOString().split('T')[0]}.csv`}
      />
      <Button onClick={handleNewRequestClick}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Apply for Certificate
      </Button>
    </div>
  );

  return (
    <>
      <DashboardLayout title="Student Dashboard" headerActions={headerActions}>
        {isLoading && requests.length === 0 ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {dashboardData.stats.map((stat, index) => (
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
                  <StudentRequestsTable
                    requests={requests}
                    onEdit={handleEditRequest}
                    onCancel={(request) => setRequestToCancel(request)}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortConfig={sortConfig}
                    onSortChange={setSortConfig}
                    onClearFilters={handleClearFilters}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                  />
                </CardContent>
              </Card>
              <Card className="col-span-full lg:col-span-3">
                <CardHeader>
                  <CardTitle>Status Overview</CardTitle>
                  <CardDescription>A breakdown of your request statuses.</CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusDistributionChart data={dashboardData.chartData} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DashboardLayout>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{requestToEdit ? 'Edit and Resubmit Request' : 'New Bonafide Certificate Request'}</DialogTitle>
            <DialogDescription>
              {requestToEdit ? 'Update the reason below and resubmit your request for approval.' : 'Fill out the form below to submit your request.'}
            </DialogDescription>
          </DialogHeader>
          <ApplyCertificateForm 
            onSuccess={() => {
              setIsApplyDialogOpen(false);
            }} 
            setOpen={setIsApplyDialogOpen}
            existingRequest={requestToEdit}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!requestToCancel} onOpenChange={(open) => !open && setRequestToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel your request. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} disabled={isCancelling} className="bg-destructive hover:bg-destructive/90">
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StudentPortal;