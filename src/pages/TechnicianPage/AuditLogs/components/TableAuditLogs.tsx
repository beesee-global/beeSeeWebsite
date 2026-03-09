import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Mail,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
  containerPadding: 'p-4',
  rowPadding: 'py-2.5 px-3', 
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours24 = date.getHours();
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  const hours = String(hours12).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0'); 

  return `${year}-${month}-${day} ${hours}:${minutes} ${period}`;
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

interface TableAuditLogsProps {
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

export default function TableAuditLogs({ 
  rows = [], 
  columns,
  selectedRowId = null,
  onRowClick,
  onRowDoubleClick,
  isLoading = false,
  sortable,
}: TableAuditLogsProps) { 

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

  const renderSortIcon = (columnId: string) => {
    const column = safeColumns.find(col => col.id === columnId);
    if (column?.sortable === false) {
      return null;
    }
    if (orderBy !== columnId || !isManualSort) {
      return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    }
    return order === 'asc' 
      ? <ArrowUp size={14} style={{ opacity: 1 }} />
      : <ArrowDown size={14} style={{ opacity: 1 }} />;
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
          
          {/* Scrollable table container */}
          <div className='overflow-x-auto'>
            <div className='min-w-[900px]'>
              {/* Header Section */}
              <div className="border-b pb-3" style={{ borderColor: COLORS.border }}>
                {/* Column Headers */}
                <div className="flex items-center py-2">
                  {safeColumns.map((column) => (
                    <div 
                      key={column.id}
                      className={`${column.width || 'flex-1'} px-4`}
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {column.sortable !== false ? (
                        <button
                          onClick={() => handleRequestSort(column.id)}
                          className={`flex items-center gap-2 ${TYPOGRAPHY.headerSize} ${TYPOGRAPHY.headerWeight}`}
                          style={{ 
                            marginLeft: column.align === 'right' ? 'auto' : '0',
                            justifyContent: column.align === 'right' ? 'flex-end' : 'flex-start',
                            width: column.align === 'right' ? '100%' : 'auto',
                            color: COLORS.text,
                            cursor: 'pointer'
                          }}
                        >
                          {column.label}
                          {renderSortIcon(column.id)}
                        </button>
                      ) : (
                        <span className={`${TYPOGRAPHY.headerSize} ${TYPOGRAPHY.headerWeight}`} style={{ color: COLORS.text }}>
                          {column.label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Body */}
              <div className="mt-1">
                {visibleRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border-b">
                    <Mail size={48} style={{ color: COLORS.textMuted }} strokeWidth={1.5} />
                    <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
                      No data found
                    </p>
                  </div>
                ) : (
                  visibleRows.map(row => {
                    const isHovered = hoveredRow === row.id;
                    const isSelected = selectedRowId === row.id;

                    return (
                      <div 
                        key={row.id} 
                        onClick={() => handleRowClick(row)}
                        onMouseEnter={() => setHoveredRow(row.id)} 
                        onMouseLeave={() => setHoveredRow(null)} 
                        className={`flex items-center ${SPACING.rowPadding} ${RADIUS.row} cursor-pointer border-b transition-all duration-200`}
                        style={{ 
                          background: isSelected ? COLORS.selected : isHovered ? COLORS.surfaceHover : 'transparent',
                          borderColor: COLORS.border
                        }}
                      > 
                        {/* Dynamic Columns */}
                        {safeColumns.map((column) => {
                          const isStatusMessage = column.id === 'status_message';
                          const statusValue = row[column.id];
                          const hasError = isStatusMessage && statusValue?.includes('Error:');
                          const displayText = isStatusMessage ? statusValue?.replace('Error:', '') : statusValue;
                          const bgColor = isStatusMessage ? (hasError ? '#fee2e2' : '#d1fae5') : 'transparent';

                          return (
                            <div 
                              key={column.id}
                              className={`${column.width || 'flex-1'} px-4`}
                              style={{ 
                                textAlign: column.align || 'left',
                                position: 'relative',
                                backgroundColor: bgColor,
                                borderRadius: bgColor !== 'transparent' ? '6px' : '0px'
                              }}
                            >
                              {column.id === 'created_at' ? (
                                <span className={`${TYPOGRAPHY.dateSize} ${TYPOGRAPHY.dateWeight}`}>
                                  {formatDate(row.created_at)}
                                </span>
                              ) : (
                                <span className="text-sm">{displayText}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          
          {/* Pagination */}
          <div className="w-full flex justify-end mt-3">      
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
