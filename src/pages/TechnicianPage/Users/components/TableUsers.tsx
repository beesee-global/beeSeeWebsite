import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react';

const COLORS = {
    primary: '#000000',
    primaryHover: '#1f2937',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceHover: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',
    selected: '#dbeafe',
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
    containerPadding: 'px-4',
    rowPadding: 'py-2.5 px-3',
    gap: 'gap-3',
};

const RADIUS = {
    container: 'rounded-lg',
    button: 'rounded-md',
    row: 'rounded-md',
    checkbox: 'rounded-md',
};

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

const getEmploymentStatusConfig = (status?: string) =>
  EMPLOYMENT_STATUS_CONFIG[status ?? ''] ?? {
    label: status ?? 'Unknown',
    classes: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

const formatDate = (dateString: string) => {
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
        if (comparison === 0 && 'id' in a && 'id' in b) {
            return (a as any).id - (b as any).id;
        }
        return comparison;
    }

    if (orderBy === 'updated_at' || orderBy === 'created_at') {
        const dateComparison = new Date(aValue as string).getTime() - new Date(bValue as string).getTime();
        if (dateComparison === 0 && 'id' in a && 'id' in b) {
            return (a as any).id - (b as any).id;
        }
        return dateComparison;
    }

    if (aValue === bValue && 'id' in a && 'id' in b) {
        return (a as any).id - (b as any).id;
    }

    return aValue > bValue ? 1 : -1;
}

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

interface TableMailProps {
    rows: RowData[];
    columns: ColumnConfig[];
    selectedRowId?: number | null;
    onRowClick?: (row: RowData) => void;
    onRowDoubleClick?: (row: RowData) => void;
    isLoading: boolean;
}

export default function TableUsers({
    rows = [],
    columns,
    selectedRowId = null,
    onRowClick,
    onRowDoubleClick,
    isLoading = false,
}: TableMailProps) {
    const [page, setPage] = useState(0);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [orderBy, setOrderBy] = useState<string>('');
    const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
    const rowsPerPage = 20;

    const safeRows = Array.isArray(rows) ? rows : [];

    const handleRequestSort = (property: string) => {
        const column = columns.find((col) => col.id === property);

        if (column?.sortable === false) {
            return;
        }

        setOrderBy(orderBy === property ? '' : property);
    };

    const sortedRows = useMemo(() => {
        if (!Array.isArray(safeRows) || safeRows.length === 0) return [];
        if (!orderBy) return safeRows;

        return [...safeRows].sort((a, b) => ascendingComparator(a, b, orderBy));
    }, [safeRows, orderBy]);

    const visibleRows = sortedRows.slice(
        page * rowsPerPage,
        (page + 1) * rowsPerPage,
    );

    const totalPages = Math.ceil(safeRows.length / rowsPerPage);
    const startIndex = page * rowsPerPage + 1;
    const endIndex = Math.min((page + 1) * rowsPerPage, safeRows.length);

    const handleRowClick = (row: RowData) => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            setClickTimeout(null);

            if (onRowDoubleClick) {
                onRowDoubleClick(row);
            }
        } else {
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
                            <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
                                Loading...
                            </p>
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
                    <div className="hidden md:block overflow-x-auto p-3">
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
                                        {columns.map((column) => (
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
                                                    {column.sortable !== false && orderBy === column.id && (
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
                                                    background: isSelected
                                                        ? COLORS.selected
                                                        : isHovered
                                                            ? COLORS.surfaceHover
                                                            : 'transparent',
                                                }}
                                            >
                                                {columns.map((column) => (
                                                    <td
                                                        key={column.id}
                                                        className={`px-4 py-3 align-middle ${
                                                            column.align === 'right' ? 'text-right' : 'text-left'
                                                        }`}
                                                    >
                                                        {column.id === 'full_name' ? (
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={row.image_url || 'https://via.placeholder.com/40'}
                                                                    alt=""
                                                                    className="h-10 w-10 rounded-full border bg-gray-50 object-cover"
                                                                />
                                                                <div className="min-w-0 flex flex-col leading-tight">
                                                                    <span className="truncate font-medium text-gray-900">
                                                                        {row.first_name} {row.last_name}
                                                                    </span>
                                                                    <span className="truncate text-xs text-gray-500">
                                                                        {row.details?.position ?? 'Staff'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : column.id === 'employment_status' ? (
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

                    <div className="w-full flex justify-end mt-4 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-6">
                            <span className={`${TYPOGRAPHY.dateSize}`} style={{ color: COLORS.textMuted }}>
                                {safeRows.length > 0
                                    ? `${startIndex}-${endIndex} of ${safeRows.length}`
                                    : '0 items'}
                            </span>

                            <div className="flex items-center gap-1">
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
