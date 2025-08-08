import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  return (
    <DashboardLayout title="Admin Dashboard" role="admin">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome, Principal!</h1>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Final Approvals</CardTitle>
          <CardDescription>Review applications approved by HODs for final sign-off.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>There are no applications pending final approval.</p>
        </Content>
      </Card>
    </DashboardLayout>
  );
};

export default AdminDashboard;