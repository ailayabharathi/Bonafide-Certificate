import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Role = "student" | "tutor" | "hod" | "admin";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // This is a mock login. In a real app, you'd have auth logic here.
    // For now, we'll just redirect to the correct dashboard.
    navigate(`/${role}/dashboard`);
  };

  const renderLoginForm = (roleTitle: string) => (
    <form onSubmit={handleLogin}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${role}-email`}>Email</Label>
          <Input id={`${role}-email`} type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${role}-password`}>Password</Label>
          <Input id={`${role}-password`} type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Login as {roleTitle}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bonafide Certificate Portal</CardTitle>
          <CardDescription>Select your role and login to continue</CardDescription>
        </CardHeader>
        <Tabs value={role} onValueChange={(value) => setRole(value as Role)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="tutor">Tutor</TabsTrigger>
            <TabsTrigger value="hod">HOD</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Login</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLoginForm("Student")}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tutor">
            <Card>
              <CardHeader>
                <CardTitle>Tutor Login</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLoginForm("Tutor")}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="hod">
            <Card>
              <CardHeader>
                <CardTitle>HOD Login</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLoginForm("HOD")}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLoginForm("Admin")}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="mt-4 text-center text-sm">
          <Link to="/" className="underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;