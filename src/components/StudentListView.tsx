import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable } from "@/components/DataTable";
import { ManagedUser } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TuteeRequestsDialog } from "@/components/TuteeRequestsDialog";
import { Input } from "@/components/ui/input";
import { useStudentList } from "@/hooks/useStudentList";
import { getStudentListColumns } from "@/lib/student-list-columns";

interface StudentListViewProps {
    title: string;
    description: string;
}

export const StudentListView = ({ title, description }: StudentListViewProps) => {
  const {
    students,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    currentPage,
    totalPages,
    setCurrentPage,
    selectedStudent,
    setSelectedStudent,
  } = useStudentList();

  const columns = useMemo(() => getStudentListColumns({
    onViewRequests: (student) => setSelectedStudent(student),
  }), [setSelectedStudent]);

  return (
    <>
      <DashboardLayout title={title}>
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center py-4">
              <Input
                placeholder="Search by name, email, or register number..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="max-w-sm"
              />
            </div>
            {isLoading && students.length === 0 ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="border rounded-md">
                <DataTable
                  columns={columns}
                  data={students}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  totalPages={totalPages}
                  rowKey={(row) => row.id}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
      <TuteeRequestsDialog
        tutee={selectedStudent}
        isOpen={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      />
    </>
  );
};