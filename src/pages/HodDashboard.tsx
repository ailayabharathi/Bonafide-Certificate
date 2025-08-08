import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HodDashboard = () => {
  return (
    <AppShell title="HOD Dashboard" role="hod">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome, HOD!</h1>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Department Applications</CardTitle>
          <CardDescription>Review applications approved by tutors in your department.</CardDescription>
        </Header>
        <CardContent>
          <p>There are no pending applications for your approval.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
};

export default HodDashboard;