import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TutorDashboard = () => {
  return (
    <DashboardLayout title="Tutor Dashboard">
      <p className="text-lg text-muted-foreground mb-6">Welcome, Tutor!</p>
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>Review applications from students assigned to you.</CardDescription>
        </Header>
        <CardContent>
          <p>There are no pending applications for your review.</p>
        </C ardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TutorDashboard;