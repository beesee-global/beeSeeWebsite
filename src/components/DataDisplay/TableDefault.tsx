import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Mail,
} from 'lucide-react';

// ============================================
// 🎨 DESIGN CUSTOMIZATION SECTION
// ============================================

const COLORS = {
  primary: '#000000',
  primaryHover: '#1f2937',
  background: '#ffffff',
  surface: '#ffffff',
  surfaceHover: '#f9fafb',
  border: '#e5e7eb',
  text: '#111827',
  textMuted: '#6b7280',
  selected: '#dbeafe', // Light blue for selected row
  checkboxBorder: '#d1d5db',
  danger: '#3f4042',
};

const TYPOGRAPHY = {
  nameSize: 'text-sm',
  nameWeight: 'font-medium',
  concernSize: 'text-sm',
  concernWeight: 'font-normal',
  dateSize: 'text-xs',
  dateWeight: 'font-normal',
  headerSize: 'text-sm',
  headerWeight: 'font-medium',
};

const SPACING = {
  containerPadding: 'px-3',
  rowPadding: 'py-2 px-3', 
  gap: 'gap-3',
};

const RADIUS = {
  container: 'rounded-lg',
  button: 'rounded-md',
  row: 'rounded-md',
  checkbox: 'rounded-md',
};

// ============================================
// 🛠️ UTILITY FUNCTIONS
// ============================================

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Sorting comparator
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  // parse if date column
  if (orderBy === 'created_at') {
    return new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
  }

  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}


type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// ============================================
// 📦 TYPES
// ============================================

interface RowData {
  id: number; 
  [key: string]: any;
}

interface ColumnConfig {
  id: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: string;
}

interface TableDefaultProps {
  rows: RowData[];
  columns: ColumnConfig[];
  selectedRowId?: number | null;
  onRowClick?: (row: RowData) => void;
  onRowDoubleClick?: (row: RowData) => void;
  isLoading: boolean;
  sortable?: string;
}

// ============================================
// 📊 MAIN COMPONENT
// ============================================

export default function TableDefault({ 
  rows = [], 
  columns,
  selectedRowId = null,
  onRowClick,
  onRowDoubleClick,
  isLoading = false,
  sortable,
}: TableDefaultProps) { 

  const [page, setPage] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>(sortable || 'created_at');
  const [isManualSort, setIsManualSort] = useState<boolean>(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const rowsPerPage = 20;

  const safeRows = Array.isArray(rows) ? rows : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  const handleRequestSort = (property: string) => {
    const column = safeColumns.find(col => col.id === property);
    if (column?.sortable === false) {
      return;
    }

    if (orderBy === property && isManualSort) {
      // Second click RESETS to backend default
      setOrder('desc'); // Backend default is DESC
      setOrderBy(sortable || 'created_at'); // Reset to backend's sort column
      setIsManualSort(false); // ✅ Turn OFF manual sort = use backend order AS-IS
    } else {
      setOrder('asc');
      setOrderBy(property);
      setIsManualSort(true);
    }
  };

  const sortedRows = useMemo(
    () => {
      if (!Array.isArray(safeRows) || safeRows.length === 0) return [];
      if (!isManualSort) {
        return safeRows;
      }
      return [...safeRows].sort(getComparator(order, orderBy));
    },
    [safeRows, order, orderBy, isManualSort]
  );

  const visibleRows = sortedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(safeRows.length / rowsPerPage);
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, safeRows.length);

  const handleRowClick = (row: RowData) => {
    if (clickTimeout) {
      // Double click detected
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      if (onRowDoubleClick) {
        onRowDoubleClick(row);
      }
    } else {
      // Single click - set timeout to detect double click
      const timeout = setTimeout(() => {
        if (onRowClick) {
          onRowClick(row);
        }
        setClickTimeout(null);
      }, 250);
      setClickTimeout(timeout);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full" style={{ background: COLORS.background }}>
        <div className="w-full mx-auto p-6">
          <div 
            className={`${RADIUS.container} ${SPACING.containerPadding} border`} 
            style={{ background: COLORS.surface, borderColor: COLORS.border }}
          >
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full h-12 w-12 border-b-2 border-gray-900 animate-spin"></div>
              <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ background: COLORS.background }}>
      <div className="w-full mx-auto">
        <div 
          className={`${RADIUS.container} ${SPACING.containerPadding} border`} 
          style={{ background: COLORS.surface, borderColor: COLORS.border }}
        >
          <div className="hidden md:block overflow-x-auto px-3 py-2">
            {visibleRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Mail size={48} style={{ color: COLORS.textMuted }} strokeWidth={1.5} />
                <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
                  No data found
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white sticky top-0">
                  <tr>
                    {safeColumns.map((column) => (
                      <th
                        key={column.id}
                        className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 ${
                          column.align === 'right' ? 'text-right' : 'text-left'
                        } ${column.sortable !== false ? 'cursor-pointer select-none' : ''}`}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        <div
                          className={`flex items-center gap-2 ${
                            column.align === 'right' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span>{column.label}</span>
                          {column.sortable !== false && orderBy === column.id && isManualSort && order === 'asc' && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {visibleRows.map((row) => {
                    const isHovered = hoveredRow === row.id;
                    const isSelected = selectedRowId === row.id;

                    return (
                      <tr
                        key={row.id}
                        onClick={() => handleRowClick(row)}
                        onMouseEnter={() => setHoveredRow(row.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          background: isSelected ? COLORS.selected : isHovered ? COLORS.surfaceHover : 'transparent',
                        }}
                      >
                        {safeColumns.map((column) => (
                          <td
                            key={column.id}
                            className={`px-4 py-3 align-middle ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                          >
                            {column.id === 'created_at' ? (
                              <span className="text-sm text-gray-500">
                                {formatDate(row.created_at)}
                              </span>
                            ) : (
                              <div className="max-w-[200px] truncate text-sm text-gray-900">
                                {row[column.id]}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile rows: the desktop table is intentionally hidden below md. */}
          <div className="md:hidden space-y-3 px-3 py-3">
            {visibleRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Mail size={40} style={{ color: COLORS.textMuted }} strokeWidth={1.5} />
                <p className="mt-3 text-sm" style={{ color: COLORS.textMuted }}>
                  No data found
                </p>
              </div>
            ) : (
              visibleRows.map((row) => {
                const isSelected = selectedRowId === row.id;

                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => handleRowClick(row)}
                    className="block w-full rounded-lg border px-3 py-3 text-left transition-colors"
                    style={{
                      background: isSelected ? COLORS.selected : COLORS.surface,
                      borderColor: isSelected ? '#93c5fd' : COLORS.border,
                    }}
                  >
                    <div className="space-y-2">
                      {safeColumns.map((column) => (
                        <div key={column.id} className="flex items-start justify-between gap-4">
                          <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500">
                            {column.label}
                          </span>
                          <span className="min-w-0 truncate text-right text-sm text-gray-900">
                            {String(row[column.id] ?? '-')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>
          
          {/* Pagination */}
          <div className="w-full flex justify-end mt-4 border-t border-gray-100 pt-3">      
            <div className="flex items-center gap-6">
              <span className={`${TYPOGRAPHY.dateSize}`} style={{ color: COLORS.textMuted }}>
                {safeRows.length > 0 ? `${startIndex}-${endIndex} of ${safeRows.length}` : '0 items'}
              </span>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(0, p - 1))} 
                  disabled={page === 0} 
                  style={{ 
                    padding: '6px',
                    borderRadius: '6px',
                    opacity: page === 0 ? 0.3 : 1,
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    color: COLORS.text,
                    background: '#f3f4f6',
                    border: 'none'
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                  disabled={page === totalPages - 1 || safeRows.length === 0} 
                  style={{ 
                    padding: '6px',
                    borderRadius: '6px',
                    opacity: (page === totalPages - 1 || safeRows.length === 0) ? 0.3 : 1,
                    cursor: (page === totalPages - 1 || safeRows.length === 0) ? 'not-allowed' : 'pointer',
                    color: COLORS.text,
                    background: '#f3f4f6',
                    border: 'none'
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
