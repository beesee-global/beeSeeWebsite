import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Trash2, 
  Pencil,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  row: 'rounded-md',
  checkbox: 'rounded-md',
};

const COLUMN_WIDTHS = {
  checkbox: 'w-12',
  name: 'w-44',
  concern: 'flex-1',
  date: 'w-32',
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
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
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

interface TableMailProps {
  rows: RowData[];
  columns: ColumnConfig[];
  handleDelete: (ids: number[]) => void;
  handleEdit: (id: number) => void;
  isLoading: boolean;
}

// ============================================
// 📊 MAIN COMPONENT
// ============================================

export default function TableJobPosting({ 
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
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const rowsPerPage = 20;
  const navigate = useNavigate();

  const safeRows = Array.isArray(rows) ? rows : [];

  const defaultColumns: ColumnConfig[] = [
    { id: 'full_name', label: 'Name', sortable: true, width: COLUMN_WIDTHS.name },
    { id: 'status', label: 'Status', sortable: true, width: 'w-32' },
    { id: 'created_at', label: 'Date', sortable: true, width: COLUMN_WIDTHS.date, align: 'right' },
  ];

  const tableColumns = columns || defaultColumns;

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRows = useMemo(
    () => {
      if (!Array.isArray(safeRows) || safeRows.length === 0) return [];
      return [...safeRows].sort((a, b) => {
        if (orderBy === 'full_name') {
          const aName = `${a.first_name} ${a.last_name}`.toLowerCase();
          const bName = `${b.first_name} ${b.last_name}`.toLowerCase();
          if (order === 'asc') {
            return aName.localeCompare(bName);
          } else {
            return bName.localeCompare(aName);
          }
        } else {
          return getComparator(order, orderBy)(a, b);
        }
      });
    },
    [safeRows, order, orderBy]
  );

  const visibleRows = sortedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(safeRows.length / rowsPerPage);
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, safeRows.length);

  const onDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (handleDelete) handleDelete([id]);
  };

  const handleEditing = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (handleEdit) handleEdit(id);
  };

  const handleSelect = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const renderSortIcon = (columnId: string) => {
    if (orderBy !== columnId) {
      return <ArrowUpDown size={14} style={{ opacity: 0 }} />;
    }
    return order === 'asc' 
      ? <ArrowUp size={14} style={{ opacity: 1 }} />
      : <ArrowDown size={14} style={{ opacity: 1 }} />;
  };

  const handleCopy = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL_FRONTEND;
      const linkToCopy = `${apiUrl}/careers/${id}`;

      navigate(linkToCopy)
      
/*       // Fallback method using textarea (works in all browsers)
      const textArea = document.createElement('textarea');
      textArea.value = linkToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          console.log('Link copied to clipboard:', linkToCopy);
          // You can add a success notification here
        } else {
          console.error('Copy command was unsuccessful');
        }
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      
      document.body.removeChild(textArea); */
    } catch (error) {
      console.error('Error copying link:', error);
      // You can add an error notification here
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
          <div className='overflow-x-auto'>
            <div className='min-w-[900px]'>
              {/* Header Section */}
              <div className="border-b pb-3" style={{ borderColor: COLORS.border }}>
                {/* Column Headers */}
                <div className="flex items-center py-2">
                  {/* Checkbox Header */}
                {/*   <div className={`${COLUMN_WIDTHS.checkbox} px-4`}></div> */}
                  
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
                    const selectedRow = selectedRows.has(row.id);

                    return (
                      <div 
                        key={row.id} 
                        onClick={(e) => handleEditing(e, row.job_reference_number)} 
                        onMouseEnter={() => setHoveredRow(row.id)} 
                        onMouseLeave={() => setHoveredRow(null)} 
                        className={`flex items-center ${SPACING.rowPadding} ${RADIUS.row} cursor-pointer border-b transition-colors`}
                        style={{ 
                          background: selectedRow ? COLORS.selected : isHovered ? COLORS.surfaceHover : 'transparent',
                          borderColor: COLORS.border
                        }}
                      >
                        
                        {/* Checkbox */}
                        {/* <div onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(e, row.id);
                        }} className={`${COLUMN_WIDTHS.checkbox} px-4`}>
                          <div 
                            className={`w-5 h-5 ${RADIUS.checkbox} border-2 flex items-center justify-center transition-colors`} 
                            style={{ 
                              borderColor: selectedRow ? COLORS.primary : COLORS.checkboxBorder, 
                              background: selectedRow ? COLORS.primary : 'transparent' 
                            }}
                          >
                            {selectedRow && <Check size={14} color="white" strokeWidth={3} />}
                          </div>
                        </div> */}

                        {/* Dynamic Columns */}
                        {tableColumns.map((column) => {
                          return (
                            <div 
                              key={column.id}
                              className={`${column.width || 'flex-1'} truncate px-4`}
                              style={{ 
                                textAlign: column.align || 'left',
                                position: 'relative'
                              }}
                            >
                              {column.id === 'full_name' ? (
                                <div className="flex items-center gap-3">
                                  {/* Avatar */}
                                  <img 
                                    src={row.image_url} 
                                    alt={row.first_name} 
                                    className="w-10 h-10 rounded-full object-cover border"
                                  />

                                  {/* Name & Position */}
                                  <div className="flex flex-col leading-tight">
                                    <span className="font-medium text-gray-900">
                                      {row.first_name} {row.last_name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {row.details?.position ?? "No position"}
                                    </span>
                                  </div>
                                </div>
                              ) : column.id === 'status' ? (
                                <div>
                                  <span className="text-gray-900">
                                    {row.details?.employment_status ?? "No status"}
                                  </span>
                                </div>
                              ) : column.id === 'created_at' ? (
                                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                  {/* Date - shown when NOT hovered */}
                                  <div 
                                    style={{ 
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'flex-end',
                                      visibility: isHovered ? 'hidden' : 'visible',
                                      position: 'absolute',
                                      right: 0,
                                      top: 0,
                                      width: '100%',
                                      height: '100%'
                                    }}
                                  >
                                    <span className={`${TYPOGRAPHY.dateSize} ${TYPOGRAPHY.dateWeight}`} style={{ color: COLORS.textMuted }}>
                                      {formatDate(row.created_at)}
                                    </span>
                                  </div>
                                  
                                  {/* Action buttons - shown when hovered */}
                                  <div 
                                    style={{ 
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'flex-end',
                                      gap: '8px',
                                      visibility: isHovered ? 'visible' : 'hidden'
                                    }}
                                  >
                                    <button 
                                      title="Edit"
                                      onClick={(e) => handleEditing(e, row.job_reference_number)}
                                      style={{ 
                                        color: '#15803d',
                                        background: '#dcfce7',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        outline: 'none'
                                      }}
                                    >
                                      <Pencil size={18} strokeWidth={2} />
                                    </button>

                                    <button 
                                      title="View Link"
                                      onClick={(e) => handleCopy(e, row.job_reference_number)}
                                      style={{ 
                                        color: '#1e40af',
                                        background: '#dbeafe',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        outline: 'none'
                                      }}
                                    >
                                      <Eye size={18} strokeWidth={2} />
                                    </button>

                                    <button 
                                      title="Delete"
                                      onClick={(e) => onDelete(e, row.id)}
                                      style={{ 
                                        color: '#dc2626',
                                        background: '#fee2e2',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        outline: 'none'
                                      }}
                                    >
                                      <Trash2 size={18} strokeWidth={2} />
                                    </button>
                                  </div>
                                </div>
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