import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  filterOptions?: string[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
}

// ============================================
// 📊 MAIN COMPONENT
// ============================================

export default function TableCustomizableHeaders({ 
  rows = [], 
  columns,
  selectedRowId = null,
  onRowClick,
  onRowDoubleClick,
  isLoading = false,
  sortable,
  filterOptions,
  selectedFilter,
  onFilterChange,
}: TableDefaultProps) { 

  const [page, setPage] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>(sortable || 'created_at');
  const [isManualSort, setIsManualSort] = useState<boolean>(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const filterScrollRef = useRef<HTMLDivElement | null>(null);
  const [showFilterArrows, setShowFilterArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rowsPerPage = 20;

  // Reset page when filter changes
  React.useEffect(() => {
    setPage(0);
  }, [selectedFilter]);

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
  
  const scrollFilters = (direction: 'left' | 'right') => {
    const container = filterScrollRef.current;
    if (!container) return;
    const delta = direction === 'left' ? -220 : 220;
    container.scrollBy({ left: delta, behavior: 'smooth' });
  };
  
  const updateFilterScrollState = () => {
    const container = filterScrollRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const hasOverflow = scrollWidth > clientWidth + 1;
    setShowFilterArrows(hasOverflow);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    updateFilterScrollState();
    const container = filterScrollRef.current;
    if (!container) return;

    const handleScroll = () => updateFilterScrollState();
    container.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateFilterScrollState());
      resizeObserver.observe(container);
    }

    const handleWindowResize = () => updateFilterScrollState();
    window.addEventListener('resize', handleWindowResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleWindowResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [filterOptions]);

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
          <div className="overflow-x-auto">
            <div className='min-w-[900px]'>
              {/* Filter Section */}
              {filterOptions && filterOptions.length > 0 && (
                <div className="border-b pb-3 mb-3" style={{ borderColor: COLORS.border }}>
                  <div className="relative">
                    {showFilterArrows && (
                      <button
                        type="button"
                        aria-label="Scroll filters left"
                        onClick={() => scrollFilters('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border bg-white shadow-sm"
                        style={{ borderColor: COLORS.border, opacity: canScrollLeft ? 1 : 0.3 }}
                        disabled={!canScrollLeft}
                      >
                        <ChevronLeft size={18} />
                      </button>
                    )}
                    {showFilterArrows && (
                      <button
                        type="button"
                        aria-label="Scroll filters right"
                        onClick={() => scrollFilters('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border bg-white shadow-sm"
                        style={{ borderColor: COLORS.border, opacity: canScrollRight ? 1 : 0.3 }}
                        disabled={!canScrollRight}
                      >
                        <ChevronRight size={18} />
                      </button>
                    )}
                    <div
                      ref={filterScrollRef}
                      className="flex flex-col md:flex-row md:items-center md:justify-start gap-3 overflow-x-hidden pb-2 md:pb-0 px-10"
                    >
                    {filterOptions.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => onFilterChange?.(filter)}
                        className={`py-2 px-4 border rounded-md transition text-sm font-medium whitespace-nowrap flex-shrink-0
                          ${selectedFilter === filter 
                            ? "bg-yellow-500 text-white border-yellow-500" 
                            : "border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {filter}
                      </button>
                    ))}
                    </div>
                  </div>
                </div>
              )}

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
                          return (
                            <div 
                              key={column.id}
                              className={`${column.width || 'flex-1'} truncate px-4`}
                              style={{ 
                                textAlign: column.align || 'left',
                                position: 'relative'
                              }}
                            >
                              {column.id === 'is_publish' ? (
                                <span
                                  className={`${
                                    row.is_publish === 1
                                      ? "bg-green-500 text-white"
                                      : "bg-red-500 text-white"
                                  } px-2 py-1 rounded-lg text-sm font-medium`}
                                >
                                  {row.is_publish === 1 ? "Published" : "Draft"}
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
