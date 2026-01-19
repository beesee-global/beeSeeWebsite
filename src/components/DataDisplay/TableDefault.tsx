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
// 🎨 DESIGN CUSTOMIZATION
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
  headerSize: 'text-sm',
  headerWeight: 'font-medium',
  dateSize: 'text-xs',
};

const SPACING = {
  containerPadding: 'p-4',
  rowPadding: 'py-2.5 px-3', 
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
  date: 'w-32', 
};

// ============================================
// 🛠 UTILITY FUNCTIONS
// ============================================

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
  handleEdit: (id: string | number) => void;
  isLoading?: boolean;
}

// ============================================
// 📊 COMPONENT
// ============================================

export default function TableDefault({ 
  rows = [], 
  columns,
  handleDelete,
  handleEdit,
  isLoading = false,
}: TableMailProps) { 

  const [page, setPage] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');
  
  // 🔢 PAGINATION LIMIT
  const rowsPerPage = 15;

  const safeRows = Array.isArray(rows) ? rows : [];

  const defaultColumns: ColumnConfig[] = [
    { id: 'name', label: 'Name', sortable: true, width: COLUMN_WIDTHS.name },
    { id: 'permission', label: 'Permission', sortable: false, width: 'flex-1' },
    { id: 'created_at', label: 'Actions', sortable: false, width: COLUMN_WIDTHS.date, align: 'right' },
  ];

  const tableColumns = columns || defaultColumns;

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRows = useMemo(() => {
    if (!Array.isArray(safeRows) || safeRows.length === 0) return [];
    return [...safeRows].sort(getComparator(order, orderBy));
  }, [safeRows, order, orderBy]);

  const visibleRows = sortedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(safeRows.length / rowsPerPage);
  const startIndex = safeRows.length > 0 ? page * rowsPerPage + 1 : 0;
  const endIndex = Math.min((page + 1) * rowsPerPage, safeRows.length);

  const onDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (handleDelete) handleDelete([id]);
  };

  const onEditAction = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (handleEdit) handleEdit(id);
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
              <div className="rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.text }}></div>
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
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="border-b pb-3" style={{ borderColor: COLORS.border }}>
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
                            color: COLORS.text,
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none',
                            padding: 0
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
                    <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>No data found</p>
                  </div>
                ) : (
                  visibleRows.map(row => {
                    const isHovered = hoveredRow === row.id;

                    return (
                      <div 
                        key={row.id} 
                        onMouseEnter={() => setHoveredRow(row.id)} 
                        onMouseLeave={() => setHoveredRow(null)} 
                        className={`flex items-center ${SPACING.rowPadding} border-b`}
                        style={{ 
                          background: isHovered ? COLORS.surfaceHover : 'transparent',
                          borderColor: COLORS.border,
                          transition: 'background 0.2s'
                        }}
                      >
                        {tableColumns.map((column) => {
                          const cellValue = row[column.id];

                          return (
                            <div 
                              key={column.id}
                              className={`${column.width || 'flex-1'} truncate px-4`}
                              style={{ textAlign: column.align || 'left' }}
                            >
                              {column.id === 'created_at' ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                  <button 
                                    title="Edit"
                                    onClick={(e) => onEditAction(e, row.pid || row.id)}
                                    style={{ 
                                      color: '#15803d',
                                      background: '#dcfce7',
                                      padding: '6px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      border: 'none'
                                    }}
                                  >
                                    <Pencil size={16} strokeWidth={2} />
                                  </button>

                                  <button 
                                    title="Delete"
                                    onClick={(e) => onDelete(e, row.id)}
                                    style={{ 
                                      color: '#dc2626',
                                      background: '#fee2e2',
                                      padding: '6px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      border: 'none'
                                    }}
                                  >
                                    <Trash2 size={16} strokeWidth={2} />
                                  </button>
                                </div>
                              ) : column.id === 'permission' ? (
                                <div className="flex flex-wrap gap-1">
                                  {Array.isArray(cellValue) && cellValue.length > 0 ? (
                                    cellValue.map((perm: string) => (
                                      <span 
                                        key={perm} 
                                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                        style={{ background: '#dbeafe', color: '#1e40af' }}
                                      >
                                        {perm}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-sm" style={{ color: COLORS.textMuted }}>—</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm" style={{ color: COLORS.text }}>{cellValue}</span>
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
          <div className="w-full flex justify-end mt-4 items-center gap-4">
            <span className={`${TYPOGRAPHY.dateSize}`} style={{ color: COLORS.textMuted }}>
              {safeRows.length > 0 ? `${startIndex}-${endIndex} of ${safeRows.length}` : '0 items'}
            </span>

            <div className="flex items-center gap-2">
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
                  border: '1px solid #e5e7eb'
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                disabled={page >= totalPages - 1 || safeRows.length === 0} 
                style={{ 
                  padding: '6px',
                  borderRadius: '6px',
                  opacity: (page >= totalPages - 1 || safeRows.length === 0) ? 0.3 : 1,
                  cursor: (page >= totalPages - 1 || safeRows.length === 0) ? 'not-allowed' : 'pointer',
                  color: COLORS.text,
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb'
                }}
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