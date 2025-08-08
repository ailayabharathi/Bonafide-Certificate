import { UserNav } from "@/components/UserNav";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const title = "Principal Dashboard";
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
               <img src="/placeholder.svg" alt="College Logo" className="h-8 w-8" />
              <span className="inline-block font-bold">ACE Portal</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <UserNav />
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{title}</h1>
        <p className="text-lg text-muted-foreground mb-6">Welcome, Principal!</p>
        <Card>
          <CardHeader>
            <CardTitle>Final Approvals</CardTitle>
            <CardDescription>Review applications approved by HODs for final sign-off.</CardDescription>
          </Header>
          <CardContent>
            <p>There are no applications pending final approval.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;