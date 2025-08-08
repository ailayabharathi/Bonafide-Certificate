import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HodDashboard = () => {
  return (
    <AppLayout title="HOD Dashboard">
      <p className="text-lg text-muted-foreground mb-6">Welcome, HOD!</p>
      <Card>
        <CardHeader>
          <CardTitle>Department Applications</CardTitle>
          <CardDescription>Review applications approved by tutors in your department.</CardDescription>
        </Header>
        <CardContent>
          <p>There are no pending applications for your approval.</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default HodDashboard;