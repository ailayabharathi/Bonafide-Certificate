import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const StudentDashboard = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Welcome, Student!</h1>
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
    </div>
  );
};

export default StudentDashboard;