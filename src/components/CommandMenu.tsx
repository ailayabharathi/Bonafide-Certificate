import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { navItems } from "@/lib/navigation";
import { useAuth, type Profile } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Sun, Moon, Laptop, FileText } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { BonafideRequestWithProfile } from "@/types";

interface CommandMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CommandMenu({ open, setOpen }: CommandMenuProps) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { setTheme } = useTheme();
  const [users, setUsers] = React.useState<Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email'>[]>([]);
  const [requests, setRequests] = React.useState<BonafideRequestWithProfile[]>([]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  React.useEffect(() => {
    if (!open || !profile) return;

    if (profile.role === 'admin') {
        const fetchUsers = async () => {
            const { data } = await supabase.from('profiles').select('id, first_name, last_name, email');
            if (data) setUsers(data);
        };
        fetchUsers();
    }

    if (profile.role !== 'student') {
        const fetchInitialRequests = async () => {
            let statusFilter: string[] = [];
            if (profile.role === 'tutor') statusFilter = ['pending'];
            if (profile.role === 'hod') statusFilter = ['approved_by_tutor'];
            if (profile.role === 'admin') statusFilter = ['approved_by_hod'];

            if (statusFilter.length === 0) return;

            const { data } = await supabase
                .from('bonafide_requests')
                .select('*, profiles!inner(first_name, last_name, register_number)')
                .in('status', statusFilter)
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (data) setRequests(data as BonafideRequestWithProfile[]);
        };
        fetchInitialRequests();
    }

  }, [profile, open]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, [setOpen]);

  if (!profile) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(profile.role));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {filteredNavItems.map((item) => (
            <CommandItem
              key={item.href}
              value={item.title}
              onSelect={() => {
                runCommand(() => navigate(item.href));
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        {profile.role === 'admin' && users.length > 0 && (
          <CommandGroup heading="Users">
            {users.map((user) => (
              <CommandItem
                key={user.id}
                value={`${user.first_name} ${user.last_name} ${user.email}`}
                onSelect={() => {
                  runCommand(() => navigate(`/admin/user/${user.id}/edit`));
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{user.first_name} {user.last_name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{user.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {requests.length > 0 && (
            <CommandGroup heading="Actionable Requests">
                {requests.map((request) => (
                    <CommandItem
                        key={request.id}
                        value={`Request from ${request.profiles?.first_name} ${request.profiles?.last_name} for ${request.reason}`}
                        onSelect={() => {
                            runCommand(() => navigate(`/${profile.role}/dashboard`, { 
                                state: { 
                                    initialSearch: request.profiles?.register_number || request.id,
                                    initialTab: 'actionable' 
                                } 
                            }));
                        }}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>{request.profiles?.first_name} {request.profiles?.last_name}</span>
                        <span className="ml-auto text-xs text-muted-foreground truncate max-w-[200px]">{request.reason}</span>
                    </CommandItem>
                ))}
            </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Theme</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Theme</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System Theme</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <CommandItem onSelect={() => runCommand(signOut)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}