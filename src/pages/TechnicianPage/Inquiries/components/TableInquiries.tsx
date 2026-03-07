import React, { useState, useMemo, useEffect } from 'react';
import CustomSelectField from '../../../../components/Fields/CustomSelectField';
import { userAuth } from '../../../../hooks/userAuth';
import { 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Trash2, 
  Reply, 
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

// ============================================
// 🛠️ UTILITY FUNCTIONS
// ============================================

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function ascendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  // Handle null / undefined
  if (aValue == null && bValue == null) {
    if ('id' in a && 'id' in b) {
      return (a as any).id - (b as any).id;
    }
    return 0;
  }
  if (aValue == null) return 1;
  if (bValue == null) return -1;

  // String sorting (A–Z, locale aware)
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
    if (comparison === 0 && 'id' in a && 'id' in b) {
      return (a as any).id - (b as any).id;
    }
    return comparison;
  }

  // Date sorting (earliest first)
  if (orderBy === 'updated_at' || orderBy === 'created_at') {
    const dateComparison = new Date(aValue as string).getTime() - new Date(bValue as string).getTime();
    if (dateComparison === 0 && 'id' in a && 'id' in b) {
      return (a as any).id - (b as any).id;
    }
    return dateComparison;
  }

  // Number sorting
  if (aValue === bValue && 'id' in a && 'id' in b) {
    return (a as any).id - (b as any).id;
  }
  
  return aValue > bValue ? 1 : -1;
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

interface TableMailProps {
  rows: RowData[];
  columns?: ColumnConfig[];
  handleDelete?: (ids: number[]) => void;
  handleEdit: (pid: number | string) => void;
  isLoading: boolean;

  organization: string;
  setOrganization: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

// ============================================
// 📊 MAIN COMPONENT
// ============================================

export default function TableInquiries({ 
  rows = [], 
  columns,
  handleEdit,
  handleDelete,
  isLoading = false, 
  statusFilter,
  setStatusFilter,
}: TableMailProps) { 

  const { userInfo } = userAuth()

  const InquiriesPermissionJob = userInfo?.permissions?.find(p=> p.parent_id === "inquiries" && p.children_id === '')
 
  const [page, setPage] = useState(0); 
  const [orderBy, setOrderBy] = useState<string>(''); // Empty means no sorting
  const rowsPerPage = 20;

  // Reset page when status filter changes
  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const safeRows = Array.isArray(rows) ? rows : [];

  const sortedRows = useMemo(
    () => {
      if (!Array.isArray(safeRows) || safeRows.length === 0) return [];
      if (!orderBy) return safeRows; // No sorting if orderBy is empty
      return [...safeRows].sort((a, b) => ascendingComparator(a, b, orderBy));
    },
    [safeRows, orderBy]
  );

  const visibleRows = sortedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(safeRows.length / rowsPerPage);
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, safeRows.length);

  const defaultColumns: ColumnConfig[] = [
    { id: 'name', label: 'Name', sortable: true, width: COLUMN_WIDTHS.name },
    { id: 'email', label: 'Email', sortable: false, width: COLUMN_WIDTHS.concern },
    { id: 'created_at', label: 'Date', sortable: true, width: COLUMN_WIDTHS.date },
    { id: 'actions', label: '', sortable: false, width: 'w-24', align: 'right' },
  ];

  const effectiveColumns = columns && columns.length > 0 ? columns : defaultColumns;
 
  const handleComplete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (handleEdit) handleEdit(id);
  };

  const onDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (handleDelete) handleDelete([id]);
  }; 

  if (isLoading) {
    return (
      <div className="w-full" style={{ background: COLORS.background }}>
        <div className="w-full mx-auto p-4 md:p-6">
          <div 
            className={`${RADIUS.container} ${SPACING.containerPadding} border`} 
            style={{ background: COLORS.surface, borderColor: COLORS.border }}
          >
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
            {/* Filter Section */}
            <div className="border-b pb-3 mb-3" style={{ borderColor: COLORS.border }}>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter("Unsettled")}
                    className={`flex-1 md:flex-none py-2 px-4 border rounded-md transition text-sm font-medium
                      ${statusFilter === "Unsettled" 
                        ? "bg-yellow-500 text-white border-yellow-500" 
                        : "border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    Unsettled
                  </button>
    
                  <button
                    onClick={() => setStatusFilter("Settled")}
                    className={`flex-1 md:flex-none py-2 px-4 border rounded-md transition text-sm font-medium
                      ${statusFilter === "Settled" 
                        ? "bg-yellow-500 text-white border-yellow-500" 
                        : "border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    Settled
                  </button>

                  {InquiriesPermissionJob?.actions.includes("closed_inquiries") && (
                    <button
                    onClick={() => setStatusFilter("Closed")}
                    className={`flex-1 md:flex-none py-2 px-4 border rounded-md transition text-sm font-medium
                      ${statusFilter === "Closed" 
                        ? "bg-yellow-500 text-white border-yellow-500" 
                        : "border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    Closed
                  </button>
                  )} 
                </div> 
    
              </div>
            </div>
    
            {/* Mobile/Tablet Card View with Scroll */}
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] md:hidden">
                {visibleRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border-b">
                        <Mail size={48} style={{ color: COLORS.textMuted }} strokeWidth={1.5} />
                        <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
                            No data found
                        </p>
                    </div>
                ) : (
                    visibleRows.map(row => (
                    <div 
                        key={row.id}
                        onClick={() => handleEdit(row.pid)}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        style={{ borderColor: COLORS.border }}
                    >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {row.name}
                            </h3>
                            <h4 className="text-sm text-gray-600 mb-1">
                                {row.email}
                            </h4>
                            <h4 className="text-sm text-gray-600 mb-1">
                                {row.contact_number}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                            {formatDate(row.created_at)}
                            </p>
                        </div>
                        <div className="flex gap-2 ml-2">
                            <button 
                            title="Reply"
                            onClick={(e) => handleComplete(e, row.pid)}
                            className="text-green-700 bg-green-100 p-2 rounded-md hover:bg-green-200 transition-colors"
                            >
                            <Reply size={16} />
                            </button>
                            {handleDelete && (
                            <button 
                                onClick={(e) => onDelete(e, row.ticket_id)}
                                className="text-red-700 bg-red-100 p-2 rounded-md hover:bg-red-200 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                            )}
                        </div>
                        </div>

                        {/* Card body */}
                        <div className='space-y-2'>
                            <div className='border-t border-gray-200 pt-2'></div>
                            <div className='flex'>
                                <span className='text-sm font-medium text-gray-500 w-28'>
                                    Company:
                                </span>
                                <span className='text-sm text-gray-900'>
                                    {row.company || '-'}
                                </span>
                            </div>
                            <div className='flex'>
                                <span className='text-sm font-medium text-gray-500 w-28'>
                                    Position:
                                </span>
                                <span className='text-sm text-gray-900'>
                                    {row.position || '-'}
                                </span>
                            </div>
                            <div className='flex'>
                                <span className='text-sm font-medium text-gray-500 w-28'>
                                    Subject:
                                </span>
                                <span className='text-sm text-gray-900'>
                                    {row.subject || '-'}
                                </span>
                            </div>

                            <div className='border-t border-gray-200 pt-2 mt-2'></div>
                            <div className='flex flex-col mt-2 p-2 bg-gray-50 rounded-md'>
                                <span className='text-sm font-medium text-gray-500 mb-1'>Description:</span>
                                <span className='text-sm text-gray-700 line-clamp-3'>{row.description || 'No description'}</span>
                            </div>
                        </div>
                    </div>
                    ))
                )}
            </div>

            {/* Desktop Table */}
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
                          scope="col"
                          className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.width || ''} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                          onClick={() => {
                            if (!col.sortable) return;
                            // Toggle between sorting this column and no sort
                            setOrderBy(orderBy === col.id ? '' : col.id);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span>{col.label}</span>
                            {col.sortable && orderBy === col.id && (
                              <svg
                                className="w-3 h-3 text-blue-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path d="M6 9l6 6 6-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
    
                  <tbody className="bg-white divide-y divide-gray-100">
                    {visibleRows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-200 cursor-pointer" onClick={() => handleEdit(row.pid)}>
                        {effectiveColumns.map((col) => (
                          <td key={col.id} className={`px-4 py-3 align-top ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                            {col.id === 'actions' ? (
                              <div className="flex justify-end items-center gap-2">
                                <button
                                  title="Reply"
                                  onClick={(e) => handleComplete(e, row.pid)}
                                  className="text-green-700 bg-green-100 p-2 rounded-md hover:bg-green-200 transition-colors"
                                >
                                  <Reply size={16} />
                                </button>
                                {handleDelete && (
                                  <button
                                    onClick={(e) => onDelete(e, row.ticket_id)}
                                    className="text-red-700 bg-red-100 p-2 rounded-md hover:bg-red-200 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            ) : col.id === 'updated_at' || col.id === 'created_at' ? (
                              <div className="text-sm text-gray-500">{formatDate(row[col.id])}</div>
                            ) : (
                              <div className="text-sm text-gray-900 truncate" style={{ maxWidth: 320 }}>{row[col.id]}</div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="w-full flex justify-end mt-3 border-t border-gray-200 pt-2">      
            <div className="flex items-center gap-6">
                <span className={`${TYPOGRAPHY.dateSize}`} style={{ color: COLORS.textMuted }}>
                {safeRows.length > 0 ? `${startIndex}-${endIndex} of ${safeRows.length}` : '0 items'}
                </span>

                <div className="flex items-center gap-1">
                <button 
                    onClick={() => setPage(p => Math.max(0, p - 1))} 
                    disabled={page === 0} 
                    className={`p-1.5 ${RADIUS.button} hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`} 
                    style={{ color: COLORS.text }}
                >
                    <ChevronLeft size={18} />
                </button>
                <button 
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                    disabled={page === totalPages - 1 || safeRows.length === 0} 
                    className={`p-1.5 ${RADIUS.button} hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`} 
                    style={{ color: COLORS.text }}
                >
                    <ChevronRight size={18} />
                </button>
                </div>
            </div>
            </div>

        </div>
        </div>
    </div>
    )
}