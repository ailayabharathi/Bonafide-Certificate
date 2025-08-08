import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  return (
    <DashboardLayout title="Principal Dashboard">
      <p className="text-lg text-muted-foreground mb-6">Welcome, Principal!</p>
      <Card>
        <CardHeader>
          <CardTitle>Final Approvals</CardTitle>
          <CardDescription>Review applications approved by HODs for final sign-off.</CardDescription>
        </Header>
        <CardContent>
          <p>There are no applications pending final approval.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminDashboard;