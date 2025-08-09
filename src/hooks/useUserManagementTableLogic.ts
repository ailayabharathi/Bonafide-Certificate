import { useState, useMemo, useEffect } from "react";
import { Profile } from "@/contexts/AuthContext";
import { departments } from "@/lib/departments";

type UserRole = 'student' | 'tutor' | 'hod' | 'admin';
type SortableKey = 'name' | 'email' | 'role' | 'department' | 'register_number';

const ITEMS_PER_PAGE = 10;

export const useUserManagementTableLogic = (
  users: Profile[],
) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all'); // Managed internally
  const [departmentFilter, setDepartmentFilter] = useState("all"); // Managed internally
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    setCurrentPage(1); // Reset page when filters or sort change
  }, [searchQuery, roleFilter, departmentFilter, sortConfig]);

  const handleSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const processedUsers = useMemo(() => {
    let filteredUsers = users
      .filter(user => {
        const name = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const email = user.email?.toLowerCase() || '';
        const department = user.department?.toLowerCase() || '';
        const registerNumber = user.register_number?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return name.includes(query) || email.includes(query) || department.includes(query) || registerNumber.includes(query);
      })
      .filter(user => {
        if (roleFilter === "all") return true;
        return user.role === roleFilter;
      })
      .filter(user => {
        if (departmentFilter === "all") return true;
        return user.department === departmentFilter;
      });

    filteredUsers.sort((a, b) => {
      let aValue: string, bValue: string;
      switch (sortConfig.key) {
        case 'name':
          aValue = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
          bValue = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'role':
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case 'department':
            aValue = a.department?.toLowerCase() || '';
            bValue = b.department?.toLowerCase() || '';
            break;
        case 'register_number':
            aValue = a.register_number?.toLowerCase() || '';
            bValue = b.register_number?.toLowerCase() || '';
            break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

    return filteredUsers;
  }, [users, searchQuery, roleFilter, departmentFilter, sortConfig]);

  const totalPages = Math.ceil(processedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = processedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return {
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    departmentFilter,
    setDepartmentFilter,
    currentPage,
    setCurrentPage,
    sortConfig,
    handleSort,
    processedUsers,
    totalPages,
    paginatedUsers,
    ITEMS_PER_PAGE,
  };
};