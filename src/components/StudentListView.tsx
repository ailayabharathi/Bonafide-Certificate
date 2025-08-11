import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DataTable } from "@/components/DataTable";
import { ColumnDef, ManagedUser } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { TuteeRequestsDialog } from "@/components/TuteeRequestsDialog";

const fetchStudentsByDepartment = async (department: string): Promise<ManagedUser[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .eq("department", department)
    .order("first_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data as ManagedUser[];
};

interface StudentListViewProps {
    title: string;
    description: string;
}

export const StudentListView = ({ title, description }: StudentListViewProps) => {
  const { profile } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<ManagedUser | null>(null);

  const { data: students = [], isLoading } = useQuery<ManagedUser[]>({
    queryKey: ["studentsByDepartment", profile?.department],
    queryFn: () => fetchStudentsByDepartment(profile!.department!),
    enabled: !!profile && !!profile.department,
  });

  const columns = useMemo((): ColumnDef<ManagedUser>[] => [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }: { row: ManagedUser }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatar_url || undefined} alt="Avatar" />
            <AvatarFallback>{`${row.first_name?.charAt(0) || ''}${row.last_name?.charAt(0) || ''}`}</AvatarFallback>
          </Avatar>
          <span>{`${row.first_name || ''} ${row.last_name || ''}`}</span>
        </div>
      ),
      enableSorting: true,
    },
    {
      id: 'register_number',
      header: 'Register Number',
      cell: ({ row }: { row: ManagedUser }) => row.register_number || 'N/A',
      enableSorting: true,
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }: { row: ManagedUser }) => row.email,
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: ManagedUser }) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedStudent(row)}>
          <Eye className="mr-2 h-4 w-4" />
          View Requests
        </Button>
      ),
      className: "text-right",
    },
  ], []);

  return (
    <>
      <DashboardLayout title={title}>
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                  sortConfig={{ key: 'name', direction: 'ascending' }}
                  onSort={() => {}} // Sorting is handled by the query for now
                  currentPage={1}
                  onPageChange={() => {}}
                  totalPages={1}
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