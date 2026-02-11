import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Mail, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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

// Employment status configuration with visual styling
const EMPLOYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; classes: string }
> = {
  Active: {
    label: 'Active',
    classes: 'bg-green-100 text-green-800 border border-green-200',
  },
  Resigned: {
    label: 'Resigned',
    classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
  Terminated: {
    label: 'Terminated',
    classes: 'bg-red-100 text-red-800 border border-red-200',
  },
  'On-leave': {
    label: 'On Leave',
    classes: 'bg-blue-100 text-blue-800 border border-blue-200',
  },
};

// Get employment status configuration or default if not found
const getEmploymentStatusConfig = (status?: string) =>
  EMPLOYMENT_STATUS_CONFIG[status ?? ''] ?? {
    label: status ?? 'Unknown',
    classes: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

// ============================================
// 🛠️ UTILITY FUNCTIONS
// ============================================

// Format date string to readable format (e.g., "Jan 15")
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Comparator function for sorting in descending order
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    // Handle null/undefined values - push them to the end
    if (b[orderBy] == null) return -1;
    if (a[orderBy] == null) return 1;
    
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

// Type for sort order
type Order = 'asc' | 'desc';

// Get comparator function based on order and orderBy column
function getComparator<Key extends keyof any>(
    order: Order, 
    orderBy: Key
): (
    a: { [key in Key]: number | string | null | undefined }, 
    b: { [key in Key]: number | string | null | undefined }
) => number {
    // If order is 'desc', use descendingComparator, otherwise reverse it for ascending
    return order === 'desc' 
        ? (a, b) => descendingComparator(a, b, orderBy) 
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// ============================================
// 📦 TYPES
// ============================================

// Row data structure - each row must have an id
interface RowData {
    id: number;
    [key: string]: any; // Allow any additional properties
}

// Column configuration structure
interface ColumnConfig {
    id: string; // Unique identifier for the column (matches row property name)
    label: string; // Display label for the column header
    sortable?: boolean; // Whether this column can be sorted (defaults to true if not specified)
    width?: string; // Optional width (e.g., 'w-32', 'flex-1')
    align?: string; // Text alignment ('left', 'center', 'right')
}

// Props for the TableUsers component
interface TableMailProps {
    rows: RowData[]; // Array of data rows to display
    columns: ColumnConfig[]; // Array of column configurations
    selectedRowId?: number | null; // ID of the currently selected row
    onRowClick?: (row: RowData) => void; // Callback when row is single-clicked
    onRowDoubleClick?: (row: RowData) => void; // Callback when row is double-clicked
    isLoading: boolean; // Whether data is currently loading
}

// ============================================
// 📊 MAIN COMPONENT
// ============================================

export default function TableUsers({ 
    rows = [], 
    columns, 
    selectedRowId = null, 
    onRowClick, 
    onRowDoubleClick, 
    isLoading = false 
}: TableMailProps) {
    // Pagination state - current page number (0-indexed)
    const [page, setPage] = useState(0);
    
    // Track which row is currently being hovered
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    
    // Sort order state - default to 'desc' (newest first)
    const [order, setOrder] = useState<Order>('desc');
    
    // Column to sort by - default to 'created_at' (show newest users first)
    const [orderBy, setOrderBy] = useState<string>('created_at');

    // Track if user has manually sorted (if false, use backend default order)
    const [isManualSort, setIsManualSort] = useState<boolean>(false);
    
    // Timeout for detecting double-click vs single-click
    const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
    
    // Number of rows to display per page
    const rowsPerPage = 20;

    // Ensure rows is always an array (defensive programming)
    const safeRows = Array.isArray(rows) ? rows : [];

    // Handle column header click to sort by that column
    const handleRequestSort = (property: string) => {
        const column = columns.find(col => col.id === property);
        
        if (column?.sortable === false) {
            return;
        }
        
        // If clicking the same column that's already sorted, just toggle asc/desc
        if (orderBy === property && isManualSort) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
            setIsManualSort(true);
        } else {
            // Clicking a new column - start with ascending order
            setOrder('asc');
            setOrderBy(property);
            setIsManualSort(true);
        }
    };

    // Memoized sorted rows - only recalculate when rows or sort params change
    const sortedRows = useMemo(() => {
        if (!Array.isArray(safeRows) || safeRows.length === 0) return [];
        
        // If user hasn't manually sorted, return rows as-is (use backend's default order)
        if (!isManualSort) {
            return safeRows; // ← KEY: Don't sort, use backend order
        }
        
        return [...safeRows].sort(getComparator(order, orderBy));
    }, [safeRows, order, orderBy, isManualSort]); // Dependencies: recalculate when these change

    // Get the rows for the current page
    const visibleRows = sortedRows.slice(
        page * rowsPerPage, // Start index
        (page + 1) * rowsPerPage // End index
    );
    
    // Calculate total number of pages
    const totalPages = Math.ceil(safeRows.length / rowsPerPage);
    
    // Calculate start and end indices for pagination display
    const startIndex = page * rowsPerPage + 1;
    const endIndex = Math.min((page + 1) * rowsPerPage, safeRows.length);

    // Handle row click with double-click detection
    const handleRowClick = (row: RowData) => {
        if (clickTimeout) {
            // This is a double-click (second click within timeout)
            clearTimeout(clickTimeout); // Cancel the single-click timeout
            setClickTimeout(null);
            
            // Trigger double-click callback
            if (onRowDoubleClick) {
                onRowDoubleClick(row);
            }
        } else {
            // This is potentially a single-click - wait to see if double-click follows
            const timeout = setTimeout(() => {
                // After 250ms with no second click, treat as single-click
                if (onRowClick) {
                    onRowClick(row);
                }
                setClickTimeout(null);
            }, 250); // 250ms threshold for double-click detection
            
            setClickTimeout(timeout);
        }
    };

    // Render the appropriate sort icon for a column
    const renderSortIcon = (columnId: string) => {
        // Find the column configuration
        const column = columns.find(col => col.id === columnId);
        
        // If column is explicitly not sortable, don't show any icon
        if (column?.sortable === false) {
            return null;
        }
        
        // If this column is not currently being sorted, show neutral icon
        if (orderBy !== columnId || !isManualSort) {
            return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
        }
        
        // Show up or down arrow based on current sort order
        return order === 'asc' 
            ? <ArrowUp size={14} style={{ opacity: 1 }} /> 
            : <ArrowDown size={14} style={{ opacity: 1 }} />;
    };

    // Loading state UI
    if (isLoading) {
        return (
            <div className="w-full" style={{ background: COLORS.background }}>
                <div className="w-full mx-auto p-6">
                    <div 
                        className={`${RADIUS.container} ${SPACING.containerPadding} border`} 
                        style={{ background: COLORS.surface, borderColor: COLORS.border }}
                    >
                        <div className="flex flex-col items-center justify-center py-16">
                            {/* Spinning loader animation */}
                            <div className="rounded-full h-12 w-12 border-b-2 border-gray-900 animate-spin"></div>
                            <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
                                Loading...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main table UI
    return (
        <div className="w-full" style={{ background: COLORS.background }}>
            <div className="w-full mx-auto">
                <div 
                    className={`${RADIUS.container} ${SPACING.containerPadding} border`} 
                    style={{ background: COLORS.surface, borderColor: COLORS.border }}
                >
                    {/* Scrollable table container for horizontal overflow on small screens */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[900px]">
                            {/* Table Header Section */}
                            <div className="border-b pb-3" style={{ borderColor: COLORS.border }}>
                                {/* Column Headers */}
                                <div className="flex items-center py-2">
                                    {columns.map((column) => (
                                        <div 
                                            key={column.id} 
                                            className={`${column.width || 'flex-1'} px-4`} 
                                            style={{ textAlign: column.align || 'left' }}
                                        >
                                            {/* Render sortable header button if sortable is not explicitly false */}
                                            {column.sortable !== false ? (
                                                <button
                                                    onClick={() => handleRequestSort(column.id)}
                                                    className={`flex items-center gap-2 ${TYPOGRAPHY.headerSize} ${TYPOGRAPHY.headerWeight}`}
                                                    style={{
                                                        marginLeft: column.align === 'right' ? 'auto' : '0',
                                                        justifyContent: column.align === 'right' ? 'flex-end' : 'flex-start',
                                                        width: column.align === 'right' ? '100%' : 'auto',
                                                        color: COLORS.text,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {column.label}
                                                    {renderSortIcon(column.id)}
                                                </button>
                                            ) : (
                                                // Non-sortable header - just display text
                                                <span 
                                                    className={`${TYPOGRAPHY.headerSize} ${TYPOGRAPHY.headerWeight}`} 
                                                    style={{ color: COLORS.text }}
                                                >
                                                    {column.label}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Table Body */}
                            <div className="mt-1">
                                {/* Empty state - no data */}
                                {visibleRows.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 border-b">
                                        <Mail size={48} style={{ color: COLORS.textMuted }} strokeWidth={1.5} />
                                        <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
                                            No data found
                                        </p>
                                    </div>
                                ) : (
                                    // Render each row
                                    visibleRows.map((row) => {
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
                                                    // Selected rows get blue background, hovered rows get light gray
                                                    background: isSelected 
                                                        ? COLORS.selected 
                                                        : isHovered 
                                                            ? COLORS.surfaceHover 
                                                            : 'transparent',
                                                    borderColor: COLORS.border,
                                                }}
                                            >
                                                {/* Render each column for this row */}
                                                {columns.map((column) => {
                                                    return (
                                                        <div
                                                            key={column.id}
                                                            className={`${column.width || 'flex-1'} truncate px-4`}
                                                            style={{
                                                                textAlign: column.align || 'left',
                                                                position: 'relative',
                                                            }}
                                                        >
                                                            {/* Custom rendering for specific columns */}
                                                            
                                                            {/* Full Name column - show avatar and name */}
                                                            {column.id === 'full_name' ? (
                                                                <div className="flex items-center gap-3">
                                                                    <img
                                                                        src={row.image_url || 'https://via.placeholder.com/40'}
                                                                        alt=""
                                                                        className="w-10 h-10 rounded-full object-cover border bg-gray-50"
                                                                    />
                                                                    <div className="flex flex-col leading-tight overflow-hidden">
                                                                        <span className="font-medium text-gray-900 truncate">
                                                                            {row.first_name} {row.last_name}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500 truncate">
                                                                            {row.details?.position ?? 'Staff'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : column.id === 'employment_status' ? (
                                                                // Employment Status column - show colored badge
                                                                (() => {
                                                                    const { label, classes } = getEmploymentStatusConfig(row.details?.employment_status);
                                                                    return (
                                                                        <span
                                                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}
                                                                        >
                                                                            {label}
                                                                        </span>
                                                                    );
                                                                })()
                                                            ) : column.id === 'created_at' ? (
                                                                // Created At column - show formatted date
                                                                <span className={`${TYPOGRAPHY.dateSize} ${TYPOGRAPHY.dateWeight}`}>
                                                                    {formatDate(row.created_at)}
                                                                </span>
                                                            ) : (
                                                                // Default column rendering - just show the value
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

                    {/* Pagination Controls */}
                    <div className="w-full flex justify-end mt-3">
                        <div className="flex items-center gap-6">
                            {/* Show current range and total count */}
                            <span className={`${TYPOGRAPHY.dateSize}`} style={{ color: COLORS.textMuted }}>
                                {safeRows.length > 0 
                                    ? `${startIndex}-${endIndex} of ${safeRows.length}` 
                                    : '0 items'
                                }
                            </span>

                            {/* Previous/Next page buttons */}
                            <div className="flex items-center gap-1">
                                {/* Previous Page Button */}
                                <button
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    style={{
                                        padding: '6px',
                                        borderRadius: '6px',
                                        opacity: page === 0 ? 0.3 : 1,
                                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                                        color: COLORS.text,
                                        background: '#f3f4f6',
                                        border: 'none',
                                    }}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                
                                {/* Next Page Button */}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1 || safeRows.length === 0}
                                    style={{
                                        padding: '6px',
                                        borderRadius: '6px',
                                        opacity: page === totalPages - 1 || safeRows.length === 0 ? 0.3 : 1,
                                        cursor: page === totalPages - 1 || safeRows.length === 0 ? 'not-allowed' : 'pointer',
                                        color: COLORS.text,
                                        background: '#f3f4f6',
                                        border: 'none',
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
