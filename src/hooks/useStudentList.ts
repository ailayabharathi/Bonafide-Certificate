import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ManagedUser, SortConfig } from "@/types";
import { useDebounce } from "./useDebounce";

const ITEMS_PER_PAGE = 10;

const fetchStudents = async (params: {
  department: string;
  searchQuery: string;
  sortConfig: SortConfig;
  page: number;
}) => {
  const { department, searchQuery, sortConfig, page } = params;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "student")
    .eq("department", department);

  if (searchQuery) {
    const searchPattern = `%${searchQuery}%`;
    query = query.or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern},register_number.ilike.${searchPattern}`);
  }

  const sortKey = sortConfig.key === 'name' ? 'first_name' : sortConfig.key;
  query = query.order(sortKey, { ascending: sortConfig.direction === 'ascending' });
  if (sortConfig.key === 'name') {
    query = query.order('last_name', { ascending: sortConfig.direction === 'ascending' });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }
  return { data: data as ManagedUser[], count: count ?? 0 };
};

export const useStudentList = () => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  const [selectedStudent, setSelectedStudent] = useState<ManagedUser | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const department = profile?.department || "";

  const queryKey = ["students", department, debouncedSearchQuery, sortConfig, currentPage];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchStudents({ department, searchQuery: debouncedSearchQuery, sortConfig, page: currentPage }),
    enabled: !!department,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, sortConfig]);

  const students = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  return {
    students,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    currentPage,
    totalPages,
    setCurrentPage,
    selectedStudent,
    setSelectedStudent,
  };
};