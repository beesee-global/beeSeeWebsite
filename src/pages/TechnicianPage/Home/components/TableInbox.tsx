import React, { useState, useMemo, useEffect } from 'react';
import CustomSelectField from '../../../../components/Fields/CustomSelectField';
import { userAuth } from '../../../../hooks/userAuth';
import { excelGenerate } from '../../../../utils/exportExcel'; 
import { 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Trash2, 
  Reply, 
  Sheet
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
  const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const hours24 = date.getHours();
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${datePart}, ${hours12}:${minutes} ${period}`;
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

interface DeviceTypeData {
  label: string;
  value: string;
}

interface TableMailProps {
  rows: RowData[];
  columns?: ColumnConfig[];
  handleDelete?: (ids: number[]) => void;
  handleEdit: (id: number) => void;
  isLoading: boolean;
  deviceListing: DeviceTypeData[];
  organization: string;
  setOrganization: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  listOfJobOrder: RowData[]; 
}

// ============================================
// 📊 MAIN COMPONENT
// ============================================

export default function TableInbox({ 
  rows = [], 
  columns,
  handleEdit,
  handleDelete,
  isLoading = false,
  organization,
  setOrganization,
  statusFilter,
  setStatusFilter, 
  deviceListing ,
  listOfJobOrder
}: TableMailProps) { 
 
  const [page, setPage] = useState(0); 
  const [orderBy, setOrderBy] = useState<string>(''); // Empty means no sorting
  // Track the currently selected row so we can highlight it in the UI.
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const rowsPerPage = 20;

  const { 
    userInfo,
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType
  } = userAuth();

  const jobOrderPermission = userInfo?.permissions?.find(p => p.parent_id === 'job-order' && p.children_id === '');

  // Reset page when status filter or organization changes
  useEffect(() => {
    setPage(0);
  }, [statusFilter, organization]);

  // Clear row selection when filters change to avoid stale highlight.
  useEffect(() => {
    setSelectedRowId(null);
  }, [statusFilter, organization, page]);

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
    { id: 'full_name', label: 'Name', sortable: true, width: COLUMN_WIDTHS.name },
    { id: 'questions', label: 'Concern', sortable: false, width: COLUMN_WIDTHS.concern },
    { id: 'updated_at', label: 'Date', sortable: true, width: COLUMN_WIDTHS.date },
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

  // Handle row click and keep only one highlighted row at a time.
  const handleRowSelect = (rowId: number) => {
    setSelectedRowId(rowId);
  };

  // ================================
  // 📊 EXCEL EXPORT HANDLER
  // ================================
  // Exports job orders to Excel with separate sheets for each status
    const handleExcelExport = async () => {
      try { 
        // ⚙️ Define columns for Pending and Ongoing sheets
        const columnsPendingOngoing = [
          { header: 'Name', key: 'full_name', width: 30, wrapText: true },
          { header: 'Job No', key: 'reference_number', width: 30, wrapText: true },
          { header: 'Company / Institution Name', key: 'company', width: 30, wrapText: true },
          { header: 'Device Type', key: 'device_type', width: 30, wrapText: true },
          { header: 'Model Type', key: 'issue_type', width: 30, wrapText: true },
          { header: 'Issue Type', key: 'issue_name', width: 30, wrapText: true },
          { header: 'Date Created', key: 'status_date', width: 30, wrapText: true }, 
        ];

        // ⚙️ Define columns for Resolved and Closed sheets
        const columnsResolvedClosed = [
          { header: 'Name', key: 'full_name', width: 30, wrapText: true },
          { header: 'Job No', key: 'reference_number', width: 30, wrapText: true },
          { header: 'Company / Institution Name', key: 'company', width: 30, wrapText: true },
          { header: 'Device Type', key: 'device_type', width: 30, wrapText: true },
          { header: 'Model Type', key: 'issue_type', width: 30, wrapText: true },
          { header: 'Issue Type', key: 'issue_name', width: 30, wrapText: true },
          { header: 'Date Completed', key: 'status_date', width: 30, wrapText: true }, 
        ];
  
        // 📦 Organize data into sheets by status
        const sheetsData: { [key: string]: RowData[] } = {
          Pending: listOfJobOrder.Pending || [],
          Ongoing: listOfJobOrder.Ongoing || [],
          Completed: listOfJobOrder.Completed || [],
          ...(jobOrderPermission?.actions.includes('close_job_order') && {
            Closed: listOfJobOrder.Closed || [],
          }),
        };
  
        // ✅ Verify we have data to export
        const totalRows = Object.values(sheetsData).reduce((sum, arr) => sum + arr.length, 0);
        if (totalRows === 0) { 
          alert('No data available to export');
          return;
        }

        // 🔄 Prepare sheets with appropriate columns
        // For Pending and Ongoing, use Date Created header
        // For Completed and Closed, use Date Completed header
        const sheetsDataWithColumns: { [key: string]: { data: RowData[]; columns: any[] } } = {
          Pending: { data: sheetsData.Pending, columns: columnsPendingOngoing },
          Ongoing: { data: sheetsData.Ongoing, columns: columnsPendingOngoing },
          Completed: { data: sheetsData.Completed, columns: columnsResolvedClosed },
        };

        // Add Closed sheet only if user has permission
        if (jobOrderPermission?.actions.includes('close_job_order') && sheetsData.Closed) {
          sheetsDataWithColumns.Closed = { data: sheetsData.Closed, columns: columnsResolvedClosed };
        } 
        
        // 📤 Call the export utility with per-sheet column configurations
        // Map each sheet name to its column configuration
        const columnConfigsPerSheet: { [key: string]: any[] } = {
          Pending: columnsPendingOngoing,
          Ongoing: columnsPendingOngoing,
          Completed: columnsResolvedClosed,
        };

        // Add Closed sheet config only if user has permission
        if (jobOrderPermission?.actions.includes('close_job_order')) {
          columnConfigsPerSheet.Closed = columnsResolvedClosed;
        }
  
        // Flatten sheetsData for export
        const flatSheetsData: { [key: string]: RowData[] } = {};
        Object.entries(sheetsDataWithColumns).forEach(([sheetName, { data }]) => {
          flatSheetsData[sheetName] = data;
        });

        // 🎯 Export with per-sheet column configurations
        await excelGenerate(
          flatSheetsData,
          columnConfigsPerSheet, // Pass per-sheet column configs
          `Job-Orders-${new Date().toISOString().split('T')[0]}`
        );
  
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        const cleanedMessage = errorMessage.replace(/Error:\s*/i, '');
        setSnackBarMessage(`Failed to export Excel: ${cleanedMessage}`);
        setSnackBarType('error');
        setSnackBarOpen(true);
      }
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
                onClick={() => setStatusFilter("Pending")}
                className={`flex-1 md:flex-none py-2 px-4 border rounded-md transition text-sm font-medium
                  ${statusFilter === "Pending" 
                    ? "bg-yellow-500 text-white border-yellow-500" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Pending
              </button>

              <button
                onClick={() => setStatusFilter("Ongoing")}
                className={`flex-1 md:flex-none py-2 px-4 border rounded-md transition text-sm font-medium
                  ${statusFilter === "Ongoing" 
                    ? "bg-yellow-500 text-white border-yellow-500" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Ongoing
              </button>

              <button
                onClick={() => setStatusFilter("Completed")}
                className={`flex-1 md:flex-none py-2 px-4 border rounded-md transition text-sm font-medium
                  ${statusFilter === "Completed" 
                    ? "bg-yellow-500 text-white border-yellow-500" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Completed
              </button>

              {jobOrderPermission?.actions.includes('close_job_order') && (
                <button
                  onClick={() => setStatusFilter("Closed")}
                  title='Closed mean all job order that already closed'
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

            <div className="flex gap-2 items-center w-full md:w-auto">
              {jobOrderPermission?.actions.includes('close_job_order') && (
                <div>
                  <button 
                    onClick={handleExcelExport}
                    title='Export excel'
                    style={{ padding: "9px 15px 9px 15px" }}
                    className='flex gap-2 items-center bg-green-200 text-green-700 rounded-md hover:bg-green-300 transition-colors text-sm font-medium'>
                    <Sheet size={16} />
                    Export
                </button>
              </div>
              )}
              
              <div>
                <CustomSelectField 
                  name="organization" 
                  value={organization} 
                  options={deviceListing} 
                  onChange={(e) => setOrganization(e.target.value)} 
                  placeholder="Select an Organization" 
                />
              </div>
            </div>

          </div>
        </div>
 
        {/* Mobile Card View */}
        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-370px)] md:hidden">
          {visibleRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Mail size={48} style={{ color: COLORS.textMuted }} strokeWidth={1.5} />
              <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
                No data found
              </p>
            </div>
          ) : (
            visibleRows.map(row => (
              <div 
                key={row.id}
                // Clicking anywhere on the card selects/highlights that row.
                onClick={() => handleEdit(row.pid)}
                className={`border rounded-lg p-4 ${row.is_read ? "bg-transparent" : "bg-amber-100"} hover:bg-gray-300 transition-colors cursor-pointer`} 
              >
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {row.full_name}
                    </h3>
                    <p className="text-md text-gray-500">
                      {formatDate(row.status_date)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button 
                      title="Reply"
                      onClick={(e) => handleComplete(e, row.pid)}
                      className="text-green-700 flex items-center justify-center bg-green-100 p-2 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Reply size={16} />
                    </button> 
                  </div>
                </div>

                <div className="space-y-2"> 

                  <div className="flex">
                    <span className="text-md font-medium text-gray-500 w-28">Job No:</span>
                    <span className="text-md text-gray-900">{row.reference_number}</span>
                  </div>  
                  <div className="flex">
                    <span className="text-md font-medium text-gray-500 w-28">Company / Institution Name:</span>
                    <span className="text-md text-gray-900">{row.company}</span>
                  </div> 

                  {row.location && (
                    <div className='flex'>
                      <span className="text-md font-medium text-gray-500 w-28">Location:</span>
                      <span className='text-md-text-gray-900'> {row.location} </span>
                    </div>
                  )}
                  
                  {row.questions && (
                    <div className="flex flex-col mt-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                      <span className="text-md font-medium text-gray-500 mb-1">Question:</span>
                      <span className="text-md text-gray-700 line-clamp-3">{row.questions}</span>
                    </div>
                  )}
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

              <tbody className={`bg-white divide-y divide-gray-100`}>
                {visibleRows.map((row) => (
                  <tr 
                    key={row.id} 
                className={`${row.is_read ? "bg-transparent" : "bg-amber-50"} hover:bg-gray-200 cursor-pointer`} 
                    onClick={() => handleEdit(row.pid)}>
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
                        ) : col.id === 'status_date' || col.id === 'updated_at' || col.id === 'created_at' ? (
                          row[col.id] != null ? (
                            <div className="text-sm text-gray-500">{formatDate(row[col.id])}</div>
                          ) : (
                            <div className="text-sm text-gray-500">Date not available</div>
                          )
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
  );
}
