import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TutorDashboard = () => {
  return (
    <AppShell title="Tutor Dashboard" role="tutor">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome, Tutor!</h1>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>Review applications from students assigned to you.</CardDescription>
        </Header>
        <CardContent>
          <p>There are no pending applications for your review.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
};

export default TutorDashboard;