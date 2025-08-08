import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HodDashboard = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Welcome, HOD!</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Department Applications</CardTitle>
          <CardDescription>Review applications approved by tutors in your department.</CardDescription>
        </Header>
        <CardContent>
          <p>There are no pending applications for your approval.</p>
        </Content>
      </Card>
    </div>
  );
};

export default HodDashboard;