import DashboardLayout from "../components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const StudentDashboard = () => {
  return (
    <DashboardLayout title="Student Dashboard" role="student">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome, Student!</h1>
        <Button>Apply for New Certificate</Button>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>Track the status of your bonafide certificate applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You have no active applications.</p>
        </Content>
      </Card>
    </DashboardLayout>
  );
};

export default StudentDashboard;