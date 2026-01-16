import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Trash2, 
  Pencil,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
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
  selected: '#f3f4f6',
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
  checkbox: 'rounded',
  row: 'rounded-md',
};

const COLUMN_WIDTHS = {
  name: 'w-44',
  concern: 'flex-1',
  date: 'w-32', // Adjusted to fit buttons and date text comfortably
};

// ============================================
// 🛠️ UTILITY FUNCTIONS
// ============================================

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
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

interface TableMailProps {
  rows: RowData[];
  columns?: ColumnConfig[];
  handleDelete: (ids: number[]) => void;
  handleEdit: (id: number) => void;
  isLoading: boolean;
}

// ============================================
// 📊 MAIN COMPONENT
// ============================================

export default function TableUsers({ 
  rows = [], 
  columns,
  handleDelete,
  handleEdit,
  isLoading = false,
}: TableMailProps) { 

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');
  
  // 🔢 PAGINATION SET TO 15
  const rowsPerPage = 15;

  const safeRows = Array.isArray(rows) ? rows : [];

  const defaultColumns: ColumnConfig[] = [
    { id: 'full_name', label: 'Name', sortable: true, width: COLUMN_WIDTHS.name },
    { id: 'concern', label: 'Concern', sortable: true, width: COLUMN_WIDTHS.concern },
    { id: 'created_at', label: 'Date', sortable: true, width: COLUMN_WIDTHS.date, align: 'right' },
  ];

  const tableColumns = columns || defaultColumns;

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRows = useMemo(() => {
    if (safeRows.length === 0) return [];
    return [...safeRows].sort((a, b) => {
      if (orderBy === 'full_name') {
        const aName = `${a.first_name} ${a.last_name}`.toLowerCase();
        const bName = `${b.first_name} ${b.last_name}`.toLowerCase();
        return order === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
      }
      return getComparator(order, orderBy)(a, b);
    });
  }, [safeRows, order, orderBy]);

  const visibleRows = sortedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(safeRows.length / rowsPerPage);
  const startIndex = safeRows.length > 0 ? page * rowsPerPage + 1 : 0;
  const endIndex = Math.min((page + 1) * rowsPerPage, safeRows.length);

  const onActionDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (handleDelete) handleDelete([id]);
  };

  const onActionEdit = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (handleEdit) handleEdit(id);
  };

  const renderSortIcon = (columnId: string) => {
    if (orderBy !== columnId) return <ArrowUpDown size={14} className="opacity-20 group-hover:opacity-50 transition-opacity" />;
    return order === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  if (isLoading) {
    return (
      <div className="w-full" style={{ background: COLORS.background }}>
        <div className="w-full mx-auto p-6">
          <div className={`${RADIUS.container} border flex flex-col items-center justify-center py-16`} style={{ background: COLORS.surface, borderColor: COLORS.border }}>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>Loading users...</p>
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
          
          <div className='overflow-x-auto'>
            <div className='min-w-[900px]'>
              {/* Table Header */}
              <div className="border-b pb-3" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center py-2">
                  {tableColumns.map((column) => (
                    <div 
                      key={column.id}
                      className={`${column.width || 'flex-1'} px-4`}
                      style={{ textAlign: column.align as any }}
                    >
                      {column.sortable !== false ? (
                        <button
                          onClick={() => handleRequestSort(column.id)}
                          className={`flex items-center gap-2 ${TYPOGRAPHY.headerSize} ${TYPOGRAPHY.headerWeight} text-gray-700 hover:text-gray-900 group transition-colors`}
                          style={{ 
                            marginLeft: column.align === 'right' ? 'auto' : '0',
                            justifyContent: column.align === 'right' ? 'flex-end' : 'flex-start',
                            width: column.align === 'right' ? '100%' : 'auto'
                          }}
                        >
                          {column.label}
                          {renderSortIcon(column.id)}
                        </button>
                      ) : (
                        <span className={`${TYPOGRAPHY.headerSize} ${TYPOGRAPHY.headerWeight} text-gray-700`}>
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
                  <div className="flex flex-col items-center justify-center py-16">
                    <Mail size={48} style={{ color: COLORS.textMuted }} strokeWidth={1.5} />
                    <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>No data found</p>
                  </div>
                ) : (
                  visibleRows.map(row => (
                    <div 
                      key={row.id} 
                      onClick={(e) => onActionEdit(e, row.id)} 
                      className={`flex items-center ${SPACING.rowPadding} ${RADIUS.row} cursor-pointer border-b hover:bg-gray-50 transition-colors`}
                      style={{ borderColor: COLORS.border }}
                    >
                      {tableColumns.map((column) => (
                        <div 
                          key={column.id}
                          className={`${column.width || 'flex-1'} truncate px-4`}
                          style={{ textAlign: column.align as any }}
                        >
                          {/* Name Column with Avatar */}
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
                                  {row.details?.position ?? "Staff"}
                                </span>
                              </div>
                            </div>
                          ) : column.id === 'created_at' ? (
                            <div className="flex items-center justify-end gap-3">
                              <span className="text-sm text-gray-500 mr-1">
                                {formatDate(row[column.id])}
                              </span>
                              
                              {/* ✅ ALWAYS VISIBLE GREEN EDIT BUTTON */}
                              <button 
                                title="Edit"
                                onClick={(e) => onActionEdit(e, row.id)}
                                className="text-green-700 hover:text-green-600 bg-green-100 p-2 rounded-md transition-colors"
                              >
                                <Pencil size={18} strokeWidth={2} />
                              </button>

                              {/* RED DELETE BUTTON */}
                              <button 
                                title="Delete"
                                onClick={(e) => onActionDelete(e, row.id)}
                                className="text-red-700 hover:text-red-600 bg-red-100 p-2 rounded-md transition-colors" 
                              >
                                <Trash2 size={18} strokeWidth={2} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-700">{row[column.id]}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Pagination Footer */}
          <div className="w-full flex justify-end items-center gap-6 mt-4 pt-2 border-t border-gray-50">      
            <span className="text-xs text-gray-500">
              {startIndex}-{endIndex} of {safeRows.length}
            </span>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))} 
                disabled={page === 0} 
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                disabled={page >= totalPages - 1 || safeRows.length === 0} 
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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