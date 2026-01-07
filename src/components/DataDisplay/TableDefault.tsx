import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
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
  date: 'w-20',
};

// ============================================
// 🛠 UTILITY FUNCTIONS
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

  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');
  const rowsPerPage = 20;

  const safeRows = Array.isArray(rows) ? rows : [];

  const defaultColumns: ColumnConfig[] = [
    { id: 'name', label: 'Name', sortable: true, width: COLUMN_WIDTHS.name },
    { id: 'permission', label: 'Permission', sortable: false, width: 'flex-1' },
    { id: 'created_at', label: '', sortable: false, width: COLUMN_WIDTHS.date, align: 'right' },
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
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, safeRows.length);

  const isSelected = (id: number) => selected.includes(id);
  const isAllSelected = selected.length === safeRows.length && safeRows.length > 0;

  const handleSelectAll = () => {
    if (selected.length === safeRows.length) {
      setSelected([]);
    } else {
      setSelected(safeRows.map(r => r.id));
    }
  };

  const handleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const onDelete = (e: React.MouseEvent, id?: number) => {
    e.stopPropagation();
    const idsToDelete = id !== undefined ? [id] : [...selected];
    if (handleDelete) handleDelete(idsToDelete);
    setSelected(prev => prev.filter(i => !idsToDelete.includes(i)));
  };

  const handleComplete = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (handleEdit) handleEdit(id);
  };

  const renderSortIcon = (columnId: string) => {
    if (orderBy !== columnId) {
      return <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />;
    }
    return order === 'asc' 
      ? <ArrowUp size={14} className="opacity-100" />
      : <ArrowDown size={14} className="opacity-100" />;
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
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header */}
              <div className="border-b pb-3" style={{ borderColor: COLORS.border }}>
                {selected.length > 0 ? (
                  <div className="flex items-center justify-between w-full py-2">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={handleSelectAll} 
                        className="flex items-center gap-2"
                        aria-label="Deselect all"
                      >
                        <div 
                          className={`w-5 h-5 ${RADIUS.checkbox} border-2 flex items-center justify-center cursor-pointer transition-colors`} 
                          style={{ borderColor: COLORS.primary, background: COLORS.primary }}
                        >
                          <div className="w-2.5 h-0.5 rounded-full bg-white" />
                        </div>
                      </button>
                      <span className="text-sm font-medium text-gray-700">
                        {selected.length} selected
                      </span>
                    </div>
                    <button 
                      title="Delete Selected" 
                      onClick={(e) => onDelete(e)} 
                      className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center py-2">
                    <button 
                      onClick={handleSelectAll} 
                      className="flex items-center gap-2 mr-4"
                      aria-label="Select all"
                    >
                      <div 
                        className={`w-5 h-5 ${RADIUS.checkbox} border-2 flex items-center justify-center cursor-pointer transition-colors`} 
                        style={{ borderColor: isAllSelected ? COLORS.primary : COLORS.checkboxBorder, 
                                 background: isAllSelected ? COLORS.primary : 'transparent' }}
                      >
                        {isAllSelected && <Check size={14} color="white" strokeWidth={3} />}
                      </div>
                    </button>

                    {tableColumns.map((column) => (
                      <div 
                        key={column.id}
                        className={`${column.width || 'flex-1'} px-4`}
                        style={{ textAlign: column.align || 'left' }}
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
                )}
              </div>

              {/* Table Body */}
              <div className="mt-1">
                {visibleRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border-b ">
                    <Mail size={48} style={{ color: COLORS.textMuted }} strokeWidth={1.5} />
                    <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
                      No data found
                    </p>
                  </div>
                ) : (
                  visibleRows.map(row => {
                    const selectedRow = isSelected(row.id);
                    const isHovered = hoveredRow === row.id;

                    return (
                      <div 
                        key={row.id} 
                        onMouseEnter={() => setHoveredRow(row.id)} 
                        onMouseLeave={() => setHoveredRow(null)} 
                        className={`flex items-center ${SPACING.rowPadding} ${RADIUS.row} cursor-pointer border-b transition-colors`}
                        style={{ 
                          background: selectedRow ? COLORS.selected : isHovered ? COLORS.surfaceHover : 'transparent',
                          borderColor: COLORS.border
                        }}
                      >
                        {/* Checkbox */}
                        <div onClick={() => handleSelect(row.id)} className={`${COLUMN_WIDTHS.checkbox} mr-4`}>
                          <div 
                            className={`w-5 h-5 ${RADIUS.checkbox} border-2 flex items-center justify-center transition-colors`} 
                            style={{ 
                              borderColor: selectedRow ? COLORS.primary : COLORS.checkboxBorder, 
                              background: selectedRow ? COLORS.primary : 'transparent' 
                            }}
                          >
                            {selectedRow && <Check size={14} color="white" strokeWidth={3} />}
                          </div>
                        </div>

                        {/* Dynamic Columns */}
                        {tableColumns.map((column) => {
                          const cellValue = row[column.id];

                          return (
                            <div 
                              onClick={() => handleEdit(row.pid)} 
                              key={column.id}
                              className={`${column.width || 'flex-1'} truncate px-4`}
                              style={{ textAlign: column.align || 'left' }}
                            >
                              {column.id === 'created_at' ? (
                                isHovered && (
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      title="Edit"
                                      onClick={(e) => handleComplete(e, row.pid)}
                                      className="text-green-700 hover:text-green-600 bg-green-100 p-2 rounded-md transition-colors"
                                    >
                                      <Pencil size={18} strokeWidth={2} />
                                    </button>

                                    <button 
                                      title="Delete"
                                      onClick={(e) => onDelete(e, row.id)}
                                      className="text-red-700 hover:text-red-600 bg-red-100 p-2 rounded-md transition-colors" 
                                    >
                                      <Trash2 size={18} strokeWidth={2} />
                                    </button>
                                  </div>
                                )
                              ) : column.id === 'permission' ? (
                                Array.isArray(cellValue) && cellValue.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {cellValue.map((perm: string) => (
                                      <span 
                                        key={perm} 
                                        className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium"
                                      >
                                        {perm}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">—</span>
                                )
                              ) : (
                                <span className="text-sm">{cellValue}</span>
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
  );
}
