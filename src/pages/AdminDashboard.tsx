import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Welcome, Principal!</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Final Approvals</CardTitle>
          <CardDescription>Review applications approved by HODs for final sign-off.</CardDescription>
        </Header>
        <CardContent>
          <p>There are no applications pending final approval.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;