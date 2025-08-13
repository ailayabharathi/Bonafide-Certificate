import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { UserNav } from "@/components/UserNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sidebar } from "@/components/Sidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { NotificationBell } from "./NotificationBell";
import { Button } from "@/components/ui/button";
import { CommandMenu } from "@/components/CommandMenu";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  headerActions?: ReactNode;
}

export const DashboardLayout = ({ children, title, headerActions }: DashboardLayoutProps) => {
  const [openCommandMenu, setOpenCommandMenu] = useState(false);

  return (
    <>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
              <div className="flex items-center gap-2 md:hidden">
                <MobileSidebar />
                <Link to="/" className="flex items-center space-x-2">
                  <img src="/logo.png" alt="College Logo" className="h-8 w-8" />
                  <span className="inline-block font-bold">ACE Portal</span>
                </Link>
              </div>
              <div className="hidden md:flex gap-6 md:gap-10">
                <Link to="/" className="flex items-center space-x-2">
                  <img src="/logo.png" alt="College Logo" className="h-8 w-8" />
                  <span className="inline-block font-bold">ACE Portal</span>
                </Link>
              </div>
              <div className="flex flex-1 items-center justify-end space-x-4">
                <Button
                  variant="outline"
                  className="relative hidden h-9 w-40 justify-start rounded-[0.5rem] text-sm font-normal text-muted-foreground shadow-none md:flex lg:w-64"
                  onClick={() => setOpenCommandMenu(true)}
                >
                  <span className="truncate">Search...</span>
                  <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
                <ThemeToggle />
                <nav className="flex items-center space-x-1">
                  <NotificationBell />
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
      </div>
      <CommandMenu open={openCommandMenu} setOpen={setOpenCommandMenu} />
    </>
  );
};