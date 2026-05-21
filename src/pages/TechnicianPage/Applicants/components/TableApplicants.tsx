import React, { useState, useMemo, useEffect } from 'react';
import { sendInterviewInvitation } from '../../../../services/Technician/applicantServices'
import ApplicantsDialog from './ApplicantsDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAuth } from '../../../../hooks/userAuth';
import {
    ChevronLeft,
    ChevronRight,
    Mail,
    CalendarClock
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

function ascendingComparator<T extends object>(a: T, b: T, orderBy: keyof T) {
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
    checkedRowIds: number[];
    setCheckedRowIds: React.Dispatch<React.SetStateAction<number[]>>;
    onDisplayDialog?: (row: RowData) => void;
    onRowDoubleClick: (row: RowData) => void;
    page?: number;
    onPageChange?: (page: number) => void;
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
  onDisplayDialog,
  isLoading = false, 
  statusFilter, 
  setStatusFilter,
  checkedRowIds,
  setCheckedRowIds,
  page: controlledPage,
  onPageChange
}: TableApplicantsProps) {
    const queryClient = useQueryClient()
    const [internalPage, setInternalPage] = useState(0);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [orderBy, setOrderBy] = useState<string>('');
    const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
    const {
        setSnackBarMessage,
        setSnackBarOpen,
        setSnackBarType,
        userInfo
    } = userAuth()
    const [emailDialogOpen, setEmailDialogOpen] = useState<boolean>(false)
    const [emailDialogFormData, setEmailDialogFormData] = useState({
        applicantName: "",
        applicantEmail: "",
        applicantPosition: "",
        applicantId: "",
    });

    const rowsPerPage = 15;
    const page = controlledPage ?? internalPage;

    useEffect(() => {
        if (controlledPage === undefined) {
            setInternalPage(0);
        }
    }, [statusFilter, controlledPage]);

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

    const handlePageChange = (updater: React.SetStateAction<number>) => {
        const nextPage = typeof updater === 'function'
            ? (updater as (prev: number) => number)(page)
            : updater;
        const normalizedPage = Math.max(0, nextPage);

        if (controlledPage !== undefined) {
            onPageChange?.(normalizedPage);
            return;
        }

        setInternalPage(normalizedPage);
    };

    useEffect(() => {
        const lastPage = Math.max(0, totalPages - 1);

        if (page > lastPage) {
            handlePageChange(lastPage);
        }
    }, [page, totalPages]);

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

    const handleDisplayDialog = (id: number) => {
        const selectedRow = rows.find((row) => row.id === id)

        if (!selectedRow ) return

        setEmailDialogFormData((prev) => ({
            ...prev,
            applicantEmail: selectedRow.email || '',
            applicantName: selectedRow.full_name || '',
            applicantPosition: selectedRow.position || '',
            applicantId: String(selectedRow.id ?? "")
        }))

        setEmailDialogOpen(true)
    }

    const { mutateAsync: sendInterviewInvitations } = useMutation ({
        mutationFn: sendInterviewInvitation
    });

    const handleEmailSubmit = async(emailData: {
        location: string;
        time: string[];
        date: string;
        schedule: string;
        format: string;
    }) => {
        const payload = {
            id: emailDialogFormData.applicantId,
            name: emailDialogFormData.applicantName,
            position: emailDialogFormData.applicantPosition,
            email: emailDialogFormData.applicantEmail,
            location: emailData.location,
            time: emailData.time,
            date: emailData.date,
            schedule_details: emailData.schedule,
            format: emailData.format,
            duration: "60",
            user_id: userInfo?.id
        }

        try {
            const response = await sendInterviewInvitations(payload)
            if (response?.success) {
                setSnackBarMessage("Interview invitation sent successfully!");
                setSnackBarType("success");
                setSnackBarOpen(true);
                queryClient.invalidateQueries({
                queryKey: ['interview-list']
                })
      }
        } catch (error: any) {
            const rawMessage = error?.response?.data.message
            const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");

            setSnackBarMessage(cleanMessage)
            setSnackBarType(error)
            setSnackBarOpen(true)
        }
    }

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
            {/* Email Dialog */}
            <ApplicantsDialog
                open={emailDialogOpen}
                onClose={() => setEmailDialogOpen(false)}
                onSubmit={handleEmailSubmit}
                applicantName={emailDialogFormData.applicantName}
                applicantEmail={emailDialogFormData.applicantEmail}
            />


            <div
                className={`${RADIUS.container} ${SPACING.containerPadding} border p-4 mb-4`}
                style={{ background: COLORS.surface, borderColor: COLORS.border }}
            >
                {/* Filter Section */}
                <div className="border-b" >
                    <div className="flex">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`py-2 px-4 border-b transition text-sm font-medium 
                                ${statusFilter === 'all' 
                                    ? 'text-yellow-500 border-yellow-500' 
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-100'}
                                `}
                        >
                            ALL
                        </button>
                        <button
                            onClick={() => setStatusFilter('new_applicants')}
                            className={`py-2 px-4 border-b transition text-sm font-medium 
                                ${statusFilter === 'new_applicants' 
                                    ? 'text-yellow-500  border-yellow-500' 
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        >
                            New Applicant
                        </button>
                        <button
                            onClick={() => setStatusFilter('short_listed')}
                            className={`py-2 px-4 border-b transition text-sm font-medium 
                                ${statusFilter === 'short_listed' 
                                    ? 'text-yellow-500 border-yellow-500' 
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Short Listed
                        </button>
                        <button
                            onClick={() => setStatusFilter('rejected')}
                            className={`py-2 px-4 border-b transition text-sm font-medium 
                                ${statusFilter === 'rejected' 
                                    ? 'text-yellow-500 border-yellow-500' 
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Rejected
                        </button>

                        <button
                            onClick={() => setStatusFilter('hired')}
                            className={`py-2 px-4 border-b transition text-sm font-medium
                                ${statusFilter === 'hired'
                                    ? 'text-yellow-500 border-yellow-500'
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Hired
                        </button>

                        <button
                            onClick={() => setStatusFilter('closed')}
                            className={`py-2 px-4 border-b transition text-sm font-medium 
                                ${statusFilter === 'closed' 
                                    ? 'text-yellow-500 border-yellow-500' 
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Closed
                        </button>
                    </div>
                </div>

                {/* Desktop Table View */}
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
                                    <th className="px-4 py-3">
                                        <input
                                            type='checkbox'
                                            checked={visibleRows.length > 0 && visibleRows.every(row => checkedRowIds.includes(row.id))}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setCheckedRowIds((prev) => [
                                                        ...new Set([...prev, ...visibleRows.map(row => row.id)])
                                                    ])
                                                } else {
                                                    setCheckedRowIds((prev) =>
                                                        prev.filter(id => !visibleRows.some(row => row.id === id))
                                                    )
                                                }
                                            }}
                                        />
                                    </th>
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
                                    const isChecked = checkedRowIds.includes(row.id);
                                    const isSelected = selectedRowId === row.id;

                                    return (
                                        <tr 
                                            key={row.id} 
                                            onClick={() => handleRowClick(row)}
                                            onMouseEnter={() => setHoveredRow(row.id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                            className="cursor-pointer transition-all duration-200"
                                            style={{
                                                background: isChecked ? COLORS.selected  : isSelected ? COLORS.selected : isHovered ? COLORS.surfaceHover : 'transparent',
                                            }}
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={checkedRowIds.includes(row.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setCheckedRowIds((prev) => [...prev, row.id]);
                                                    } else {
                                                        setCheckedRowIds((prev) => prev.filter(id => id !== row.id));
                                                    }
                                                    }}
                                                />
                                            </td>
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
                                                    ) : col.id === 'full_name' ? (
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {row?.schedule_date ? (
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 hover:shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDisplayDialog(row.id)
                                                                    }}
                                                                    title="Reschedule interview"
                                                                    aria-label="Reschedule interview"
                                                                >
                                                                    <CalendarClock size={16} strokeWidth={2.25} />
                                                                </button>
                                                            ) : (
                                                                <span className="h-8 w-8 shrink-0" aria-hidden="true" />
                                                            )}
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-medium text-gray-900 truncate max-w-[220px]">
                                                                    {row[col.id]}
                                                                </div>
                                                            </div>
                                                        </div>
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
                                onClick={() => handlePageChange((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => handlePageChange((p) => Math.min(totalPages - 1, p + 1))}
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
