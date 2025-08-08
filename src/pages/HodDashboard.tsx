import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HodDashboard = () => {
  return (
    <DashboardLayout title="HOD Dashboard" role="hod">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome, HOD!</h1>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Department Applications</CardTitle>
          <CardDescription>Review applications approved by tutors in your department.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>There are no pending applications for your approval.</p>
        </Content>
      </Card>
    </DashboardLayout>
  );
};

export default HodDashboard;