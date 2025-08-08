import AppShell from "../components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TutorDashboard = () => {
  return (
    <AppShell title="Tutor Dashboard">
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
    </AppShell>
  );
};

export default TutorDashboard;