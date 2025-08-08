import { LayoutDashboard, Users, User, GraduationCap, BookText } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: Array<'student' | 'tutor' | 'hod' | 'admin'>;
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
    roles: ["student"],
  },
  {
    title: "Dashboard",
    href: "/tutor/dashboard",
    icon: LayoutDashboard,
    roles: ["tutor"],
  },
  {
    title: "Dashboard",
    href: "/hod/dashboard",
    icon: LayoutDashboard,
    roles: ["hod"],
  },
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    title: "User Management",
    href: "/admin/user-management",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    roles: ["student", "tutor", "hod", "admin"],
  },
];