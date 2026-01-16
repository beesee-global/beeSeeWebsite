import React, { useState, useMemo, useEffect } from 'react';
import { downloadFile } from '../../../../utils/downloadFile'
import { 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Trash2, 
  Plus, 
  Eye
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
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

export default function TableApplicants({ 
  rows = [], 
  columns,
  handleEdit,
  handleDelete,
  isLoading = false, 
  statusFilter,
  setStatusFilter,
}: TableMailProps) { 
 
  const [page, setPage] = useState(0); 
  const [orderBy, setOrderBy] = useState<string>(''); 
  
  // 🔢 UPDATED TO 15 ITEMS PER PAGE
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
          <div className={`${RADIUS.container} ${SPACING.containerPadding} border flex flex-col items-center justify-center py-16`} style={{ background: COLORS.surface, borderColor: COLORS.border }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>Loading...</p>
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
              onClick={() => setStatusFilter("all")}
              className={`py-2 px-4 border rounded-md transition text-sm font-medium ${statusFilter === "all" ? "bg-yellow-500 text-white border-yellow-500" : "border-gray-200 text-gray-700 hover:bg-gray-100"}`}
            >
              ALL
            </button>
            <button
              onClick={() => setStatusFilter("short_listed")}
              className={`py-2 px-4 border rounded-md transition text-sm font-medium ${statusFilter === "short_listed" ? "bg-yellow-500 text-white border-yellow-500" : "border-gray-200 text-gray-700 hover:bg-gray-100"}`}
            >
              Short Listed
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          {visibleRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Mail size={48} style={{ color: COLORS.textMuted }} strokeWidth={1.5} />
              <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>No data found</p>
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
                {visibleRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEdit(row.id)}>
                    {effectiveColumns.map((col) => (
                      <td key={col.id} className={`px-4 py-3 align-middle ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                        {col.id === 'actions' ? (
                          <div className="flex items-center gap-2 justify-end">
                            <button title="View" onClick={(e) => { e.stopPropagation(); downloadFile(row.attachment_url, "view", row.name) }} className="text-blue-600 bg-blue-50 p-2 rounded-md hover:bg-blue-100 transition-colors"><Eye size={16} /></button>
                            {row.status !== 'SHORTLISTED' && <button title="Shortlist" onClick={(e) => handleComplete(e, row.id)} className="text-green-700 bg-green-50 p-2 rounded-md hover:bg-green-100 transition-colors"><Plus size={16} /></button>}
                            <button title="Delete" onClick={(e) => onDelete(e, row.id)} className="text-red-700 bg-red-50 p-2 rounded-md hover:bg-red-100 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        ) : col.id === 'created_at' ? (
                          <span className="text-sm text-gray-500">{formatDate(row[col.id])}</span>
                        ) : (
                          <div className="text-sm text-gray-900 truncate max-w-[200px]">{row[col.id]}</div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="w-full flex justify-end mt-4 border-t border-gray-100 pt-3"> 
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-500">
              {safeRows.length > 0 ? `${startIndex}-${endIndex} of ${safeRows.length}` : '0 items'}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))} 
                disabled={page === 0}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
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