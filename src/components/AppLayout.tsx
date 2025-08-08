import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
  return (
    <div className="p-4">
      <header className="pb-4 mb-4 border-b">
        <h1 className="text-2xl font-bold">{title}</h1>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;