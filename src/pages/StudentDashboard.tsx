import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const StudentDashboard = () => {
  return (
    <DashboardLayout title="Student Dashboard">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg text-muted-foreground">Welcome, Student!</p>
        <Button>Apply for New Certificate</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>Track the status of your bonafide certificate applications.</CardDescription>
        </Header>
        <CardContent>
          <p>You have no active applications.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StudentDashboard;