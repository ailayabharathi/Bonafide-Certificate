import { useState, useMemo, useEffect } from "react";

const ITEMS_PER_PAGE = 10;

interface UseDataTableProps<TData> {
  data: TData[];
  rowKey: (row: TData) => string;
  isRowSelectable?: (row: TData) => boolean;
}

export const useDataTable = <TData>({
  data,
  rowKey,
  isRowSelectable,
}: UseDataTableProps<TData>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [data]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedRows = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const selectableRowIdsOnPage = useMemo(() => 
    isRowSelectable 
      ? paginatedRows.filter(isRowSelectable).map(rowKey)
      : [],
    [paginatedRows, isRowSelectable, rowKey]
  );

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };

  const handleSelectAllOnPage = (checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...new Set([...prev, ...selectableRowIdsOnPage])]);
    } else {
      setSelectedIds(prev => prev.filter(id => !selectableRowIdsOnPage.includes(id)));
    }
  };

  return {
    currentPage,
    setCurrentPage,
    selectedIds,
    setSelectedIds,
    handleToggleSelect,
    handleSelectAllOnPage,
    paginatedRows,
    totalPages,
    selectableRowIdsOnPage,
  };
};