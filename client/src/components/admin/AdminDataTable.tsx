import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimplePagination } from "@/components/ui/pagination";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  getSearchValue?: (item: T) => string;
  paginated?: boolean;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  className?: string;
}

export default function AdminDataTable<T extends { [key: string]: any }>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Rechercher...",
  getSearchValue,
  paginated = true,
  pageSize = 20,
  onRowClick,
  className,
}: AdminDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filtrage par recherche
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      if (getSearchValue) {
        return getSearchValue(item).toLowerCase().includes(query);
      }
      // Recherche par défaut sur toutes les colonnes
      return columns.some((col) => {
        const value = item[col.key];
        return value && String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, columns, getSearchValue]);

  // Tri
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    const column = columns.find((col) => col.key === sortColumn);
    if (!column || !column.sortable) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, page, pageSize, paginated]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column || !column.sortable) return;
    
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barre de recherche */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset à la première page lors de la recherche
            }}
            className="pl-10"
          />
        </div>
      )}

      {/* Tableau */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    column.sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
                    "select-none"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  {searchQuery ? "Aucun résultat trouvé" : "Aucune donnée"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow
                  key={index}
                  className={onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900" : ""}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex justify-center">
          <SimplePagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={sortedData.length}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Compteur de résultats */}
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {sortedData.length} résultat{sortedData.length > 1 ? 's' : ''} 
        {searchQuery && ` pour "${searchQuery}"`}
      </div>
    </div>
  );
}

