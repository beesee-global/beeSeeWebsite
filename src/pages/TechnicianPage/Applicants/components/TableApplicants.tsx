import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';

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
    containerPadding: 'p-3 md:p-4',
    rowPadding: 'py-2.5 px-3',
    gap: 'gap-3',
};

const RADIUS = {
    container: 'rounded-lg',
    button: 'rounded-md',
    checkbox: 'rounded',
    row: 'rounded-md',
};

const COLUMN_WIDTHS = {
    checkbox: 'w-8',
    name: 'w-44',
    concern: 'flex-1',
    date: 'w-20',
};

const STATUS_CONFIG: Record<
  string,
  { label: string; classes: string }
> = {
  NEW_APPLICANT: {
    label: 'New Applicant',
    classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    classes: 'bg-blue-100 text-blue-800 border border-blue-200',
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-red-100 text-red-800 border border-red-200',
  },
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? {
    label: status,
    classes: 'bg-gray-100 text-gray-700 border border-gray-200',
  };


// ============================================
// 🛠️ UTILITY FUNCTIONS
// ============================================

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function ascendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue == null && bValue == null) {
        if ('id' in a && 'id' in b) return (a as any).id - (b as any).id;
        return 0;
    }
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
        if (comparison === 0 && 'id' in a && 'id' in b) return (a as any).id - (b as any).id;
        return comparison;
    }

    if (orderBy === 'updated_at' || orderBy === 'created_at') {
        const dateComparison = new Date(aValue as string).getTime() - new Date(bValue as string).getTime();
        if (dateComparison === 0 && 'id' in a && 'id' in b) return (a as any).id - (b as any).id;
        return dateComparison;
    }

    if (aValue === bValue && 'id' in a && 'id' in b) return (a as any).id - (b as any).id;
    return aValue > bValue ? 1 : -1;
}

// ============================================
// 📦 TYPES
// ============================================

interface RowData {
    id: number;
    status: string;
    [key: string]: any;
}

interface ColumnConfig {
    id: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: string;
}

interface TableApplicantsProps {
    rows: RowData[];
    columns?: ColumnConfig[];
    selectedRowId: number | null;
    onRowClick: (row: RowData) => void;
    onRowDoubleClick: (row: RowData) => void;
    isLoading: boolean;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
}

// ============================================
// 📊 MAIN COMPONENT
// ============================================

export default function TableApplicants({ 
  rows = [], 
  columns,
  selectedRowId,
  onRowClick,
  onRowDoubleClick,
  isLoading = false, 
  statusFilter, 
  setStatusFilter 
}: TableApplicantsProps) {
    const [page, setPage] = useState(0);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [orderBy, setOrderBy] = useState<string>('');
    const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

    const rowsPerPage = 15;

    useEffect(() => {
        setPage(0);
    }, [statusFilter]);

    const safeRows = Array.isArray(rows) ? rows : [];

    const sortedRows = useMemo(() => {
        if (safeRows.length === 0) return [];
        if (!orderBy) return safeRows;
        return [...safeRows].sort((a, b) => ascendingComparator(a, b, orderBy));
    }, [safeRows, orderBy]);

    const visibleRows = sortedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    const totalPages = Math.ceil(safeRows.length / rowsPerPage);
    const startIndex = safeRows.length > 0 ? page * rowsPerPage + 1 : 0;
    const endIndex = Math.min((page + 1) * rowsPerPage, safeRows.length);

    const defaultColumns: ColumnConfig[] = [
        { id: 'full_name', label: 'Name', sortable: true },
        { id: 'phone', label: 'Phone', sortable: true },
        { id: 'email', label: 'Email', sortable: true },
        { id: 'status', label: 'Status', sortable: true },
    ];

    const effectiveColumns = columns && columns.length > 0 ? columns : defaultColumns;

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

    if (isLoading) {
        return (
            <div className="w-full" style={{ background: COLORS.background }}>
                <div className="w-full mx-auto p-4 md:p-6">
                    <div
                        className={`${RADIUS.container} ${SPACING.containerPadding} border flex flex-col items-center justify-center py-16`}
                        style={{ background: COLORS.surface, borderColor: COLORS.border }}
                    >
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
                            Loading...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full" style={{ background: COLORS.background }}>
            <div className={`${RADIUS.container} ${SPACING.containerPadding} border`} style={{ background: COLORS.surface, borderColor: COLORS.border }}>
                {/* Filter Section */}
                <div className="border-b pb-3 mb-3" style={{ borderColor: COLORS.border }}>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`py-2 px-4 border rounded-md transition text-sm font-medium ${statusFilter === 'all' ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        >
                            ALL
                        </button>
                        <button
                            onClick={() => setStatusFilter('short_listed')}
                            className={`py-2 px-4 border rounded-md transition text-sm font-medium ${statusFilter === 'short_listed' ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Short Listed
                        </button>
                        <button
                            onClick={() => setStatusFilter('rejected')}
                            className={`py-2 px-4 border rounded-md transition text-sm font-medium ${statusFilter === 'rejected' ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Rejected
                        </button>

                        <button
                            onClick={() => setStatusFilter('closed')}
                            className={`py-2 px-4 border rounded-md transition text-sm font-medium ${statusFilter === 'closed' ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Closed
                        </button>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
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
                                    {effectiveColumns.map((col) => (
                                        <th
                                            key={col.id}
                                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                                            onClick={() => col.sortable && setOrderBy(orderBy === col.id ? '' : col.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{col.label}</span>
                                                {col.sortable && orderBy === col.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
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
                                            {effectiveColumns.map((col) => (
                                                <td key={col.id} className={`px-4 py-3 align-middle ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                                                    {col.id === 'status' ? (
                                                        (() => {
                                                            const { label, classes } = getStatusConfig(row.status);
                                                            return (
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}
                                                            >
                                                                {label}
                                                            </span>
                                                            );
                                                        })()
                                                    ) : col.id === 'created_at' ? (
                                                        <span className="text-sm text-gray-500">{formatDate(row[col.id])}</span>
                                                    ) : (
                                                        <div className="text-sm text-gray-900 truncate max-w-[200px]">{row[col.id]}</div>
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

                {/* Pagination Footer */}
                <div className="w-full flex justify-end mt-4 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-gray-500">{safeRows.length > 0 ? `${startIndex}-${endIndex} of ${safeRows.length}` : '0 items'}</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1 || safeRows.length === 0}
                                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}