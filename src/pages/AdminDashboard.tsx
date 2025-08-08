import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  return (
    <AppShell title="Admin Dashboard" role="admin">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome, Principal!</h1>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Final Approvals</CardTitle>
          <CardDescription>Review applications approved by HODs for final sign-off.</CardDescription>
        </Header>
        <CardContent>
          <p>There are no applications pending final approval.</p>
        </Content>
      </Card>
    </AppShell>
  );
};

export default AdminDashboard;