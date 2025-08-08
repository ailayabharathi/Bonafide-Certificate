import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { buttonVariants } from "@/components/ui/button";

export const Sidebar = () => {
  const { profile } = useAuth();
  const location = useLocation();

  if (!profile) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(profile.role));

  return (
    <aside className="hidden md:flex flex-col h-full w-56 border-r bg-sidebar text-sidebar-foreground p-4">
      <nav className="grid gap-1 px-2">
        {filteredNavItems.map((item, index) => (
          <TooltipProvider key={index}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    location.pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "justify-start",
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {item.title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>
    </aside>
  );
};