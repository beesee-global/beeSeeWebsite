import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Mail,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { LucideIcon } from "../../../../utils/lucideIconLoader";

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

const COLUMN_WIDTHS = {
  checkbox: 'w-12',
  name: 'w-44',
  concern: 'flex-1',
  date: 'w-32',
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
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
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
};

const STATUS_CONFIG: Record<
  string,
  { label: string; classes: string}
> = {
  Accepting_Applications: {
    label: 'Accepting Applications',
    classes: 'bg-blue-100 text-blue-800 border border-blue-200',
  },
  Closed: {
    label: 'Closed',
    classes: 'bg-red-100 text-red-800 border border-red-200',
  },
}

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? {
    label: status, 
    classes: 'bg-gray-100 text-gray-700 border border-gray-200',
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

interface CategoryTableProps {
  rows: RowData[];
  columns: ColumnConfig[];
  selectedRowId: number | null;
  onRowClick: (row: RowData) => void;
  onRowDoubleClick: (row: RowData) => void;
  isLoading: boolean;
}

// ============================================
// 📊 MAIN COMPONENT
// ============================================

export default function CategoryTable({ 
  rows = [], 
  columns,
  selectedRowId,
  onRowClick,
  onRowDoubleClick,
  isLoading = false,
}: CategoryTableProps) { 

  const [page, setPage] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('job_reference_number');
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const rowsPerPage = 20;

  const safeRows = Array.isArray(rows) ? rows : [];

  const defaultColumns: ColumnConfig[] = [
    { id: 'job_reference_number', label: 'Job No.', sortable: true, align: 'left' },
    { id: 'title', label: 'Job Position', sortable: false, align: 'left' },   
  ];

  const tableColumns = columns || defaultColumns;

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRows = useMemo(
    () => {
      if (!Array.isArray(safeRows) || safeRows.length === 0) return [];
      return [...safeRows].sort((a, b) => {
        if (orderBy === 'full_name') {
          const aName = `${a.first_name} ${a.last_name}`.toLowerCase();
          const bName = `${b.first_name} ${b.last_name}`.toLowerCase();
          if (order === 'asc') {
            return aName.localeCompare(bName);
          } else {
            return bName.localeCompare(aName);
          }
        } else {
          return getComparator(order, orderBy)(a, b);
        }
      });
    },
    [safeRows, order, orderBy]
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
      onRowDoubleClick(row);
    } else {
      // Single click - set timeout to detect double click
      const timeout = setTimeout(() => {
        onRowClick(row);
        setClickTimeout(null);
      }, 250);
      setClickTimeout(timeout);
    }
  };

  const renderSortIcon = (columnId: string) => {
    if (orderBy !== columnId) {
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
                  {tableColumns.map((column) => (
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
                        {tableColumns.map((column) => {
                          return (
                            <div 
                              key={column.id}
                              className={`${column.width || 'flex-1'} truncate px-4`}
                              style={{ 
                                textAlign: column.align || 'left',
                                position: 'relative'
                              }}
                            >
                              {column.id === 'status' ? (
                               (() => {
                                const { label,classes } = getStatusConfig(row.status);
                                return (
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
                                    {label}
                                  </span>
                                )
                               })()
                              ) :  column.id === 'icon' ? (
                                <span className={`${TYPOGRAPHY.dateSize} ${TYPOGRAPHY.dateWeight}`}>
                                   <LucideIcon name={row.icon} size={18} />
                                </span>
                              ) : column.id === 'created_at' ? (
                                <span className={`${TYPOGRAPHY.dateSize} ${TYPOGRAPHY.dateWeight}`}>
                                  {formatDate(row.created_at)}
                                </span>
                              ) : (
                                <span className="text-sm">{row[column.id]}</span>
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