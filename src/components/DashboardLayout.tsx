import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  role: string;
}

const DashboardLayout = ({ children, title, role }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">({role})</p>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        {children}
      </main>
    </div>
  );
};

export { DashboardLayout };