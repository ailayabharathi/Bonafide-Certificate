import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const StudentDashboard = () => {
  return (
    <AppShell title="Student Dashboard" role="student">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome, Student!</h1>
        <Button>Apply for New Certificate</Button>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>Track the status of your bonafide certificate applications.</CardDescription>
        </Header>
        <CardContent>
          <p>You have no active applications.</p>
        </Content>
      </Card>
    </AppShell>
  );
};

export default StudentDashboard;