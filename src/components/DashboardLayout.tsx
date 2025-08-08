import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { UserNav } from "@/components/UserNav";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  headerActions?: ReactNode;
}

export const DashboardLayout = ({ children, title, headerActions }: DashboardLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/placeholder.svg" alt="College Logo" className="h-8 w-8" />
              <span className="inline-block font-bold">ACE Portal</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <ThemeToggle />
            <nav className="flex items-center space-x-1">
              <UserNav />
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {headerActions}
        </div>
        {children}
      </main>
    </div>
  );
};