import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TutorDashboard = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Welcome, Tutor!</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>Review applications from students assigned to you.</CardDescription>
        </Header>
        <CardContent>
          <p>There are no pending applications for your review.</p>
        </Content>
      </Card>
    </div>
  );
};

export default TutorDashboard;