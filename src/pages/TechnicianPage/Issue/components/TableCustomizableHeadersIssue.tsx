import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Mail,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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

// ============================================
// 🛠️ UTILITY FUNCTIONS
// ============================================

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Sorting comparator
function normalizeSortValue(value: any) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : item?.name ?? ''))
      .join(', ');
  }
  if (value === null || value === undefined) return '';
  return value;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const rawAValue = a[orderBy];
  const rawBValue = b[orderBy];
  const aValue = normalizeSortValue(rawAValue);
  const bValue = normalizeSortValue(rawBValue);

  // parse if date column
  if (orderBy === 'created_at') {
    return new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
  }

  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
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

interface TableDefaultProps {
  rows: RowData[];
  columns: ColumnConfig[];
  selectedRowId?: number | null;
  onRowClick?: (row: RowData) => void;
  onRowDoubleClick?: (row: RowData) => void;
  onModelClick?: (issueId: number, issueName: string) => void;
  isLoading: boolean;
  sortable?: string;
  filterOptionsDevices?: string[];
  filterOptionsModels?: string[];
  selectedDeviceFilter?: string;
  selectedModelFilter?: string;
  onDeviceFilterChange?: (filter: string) => void;
  onModelFilterChange?: (filter: string) => void;
  onTogglePublish?: (detailId: number, nextPublish: boolean) => void;
  publishingIds?: number[];
  onToggleModel?: (
    baseDetailId: number,
    modelDetailId: number | null,
    productId: number,
    issueKey: string,
    nextChecked: boolean,
  ) => Promise<number | null> | void;
  modelUpdatingIds?: number[];
}

// ============================================
// 📊 MAIN COMPONENT
// ============================================

export default function TableCustomizableHeaders({ 
  rows = [], 
  columns,
  selectedRowId = null,
  onRowClick,
  onRowDoubleClick,
  onModelClick,
  isLoading = false,
  sortable,
  filterOptionsDevices,
  filterOptionsModels,
  selectedDeviceFilter,
  selectedModelFilter,
  onDeviceFilterChange,
  onModelFilterChange,
  onTogglePublish,
  publishingIds = [],
  onToggleModel,
  modelUpdatingIds = [],
}: TableDefaultProps) { 

  const [page, setPage] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>(sortable || 'created_at');
  const [isManualSort, setIsManualSort] = useState<boolean>(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [modelCheckedMap, setModelCheckedMap] = useState<Record<string, boolean>>({});
  const filterScrollRef = useRef<HTMLDivElement | null>(null);
  const [showFilterArrows, setShowFilterArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rowsPerPage = 20;

  // Reset page when filter changes
  React.useEffect(() => {
    setPage(0);
  }, [selectedDeviceFilter, selectedModelFilter]);

  const safeRows = Array.isArray(rows) ? rows : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  const handleRequestSort = (property: string) => {
    const column = safeColumns.find(col => col.id === property);
    if (column?.sortable === false) {
      return;
    }

    if (orderBy === property && isManualSort) {
      // Second click RESETS to backend default
      setOrder('desc'); // Backend default is DESC
      setOrderBy(sortable || 'created_at'); // Reset to backend's sort column
      setIsManualSort(false); // ✅ Turn OFF manual sort = use backend order AS-IS
    } else {
      setOrder('asc');
      setOrderBy(property);
      setIsManualSort(true);
    }
  };

  const sortedRows = useMemo(
    () => {
      if (!Array.isArray(safeRows) || safeRows.length === 0) return [];
      if (!isManualSort) {
        return safeRows;
      }
      return [...safeRows].sort(getComparator(order, orderBy));
    },
    [safeRows, order, orderBy, isManualSort]
  );

  const visibleRows = sortedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(safeRows.length / rowsPerPage);
  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, safeRows.length);

  const handleRowClick = (row: RowData) => {
    if (clickTimeout) {
      // Double click detected
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      if (onRowDoubleClick) {
        onRowDoubleClick(row);
      }
    } else {
      // Single click - set timeout to detect double click
      const timeout = setTimeout(() => {
        if (onRowClick) {
          onRowClick(row);
        }
        setClickTimeout(null);
      }, 250);
      setClickTimeout(timeout);
    }
  };

  useEffect(() => {
    setModelCheckedMap((prev) => {
      const next: Record<string, boolean> = {};
      const setValue = (key: string, value: boolean) => {
        if (key) {
          next[key] = value;
        }
      };

      safeRows.forEach((row) => {
        if (Array.isArray(row?.product_name)) {
          row.product_name.forEach((item: any) => {
            const productId = Number(item?.product_id);
            const issueKey = row?.issue_key ?? '';
            const key = item?.detail_id
              ? `detail-${item.detail_id}`
              : `issue-${issueKey}-product-${Number.isNaN(productId) ? item?.name ?? '' : productId}`;
            setValue(key, !!item?.is_selected);
          });
        } else {
          const productId = Number(row?.product_id);
          const issueKey = row?.issue_key ?? '';
          const key = row?.id
            ? `detail-${row.id}`
            : `issue-${issueKey}-product-${Number.isNaN(productId) ? row?.product_name ?? '' : productId}`;
          setValue(key, true);
        }
      });

      return { ...prev, ...next };
    });
  }, [safeRows]);

  const renderSortIcon = (columnId: string) => {
    const column = safeColumns.find(col => col.id === columnId);
    if (column?.sortable === false) {
      return null;
    }
    if (orderBy !== columnId || !isManualSort) {
      return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    }
    return order === 'asc' 
      ? <ArrowUp size={14} style={{ opacity: 1 }} />
      : <ArrowDown size={14} style={{ opacity: 1 }} />;
  };

  const renderModelList = (
    items: Array<{
      name: string;
      detail_id?: number;
      product_id?: number | string;
      is_selected?: boolean;
    }>,
    issueKey: string,
    baseDetailId: number,
  ) => {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const productId = Number(item?.product_id);
          const key = item?.detail_id
            ? `detail-${item.detail_id}`
            : `issue-${issueKey}-product-${Number.isNaN(productId) ? item?.name ?? '' : productId}`;
          const isChecked = modelCheckedMap[key] ?? !!item?.is_selected;
          const detailId = Number(item?.detail_id);
          const isUpdating = modelUpdatingIds.includes(baseDetailId);

          return (
            <label
              key={`model-${item.name}`}
              className="inline-flex items-center gap-1 text-sm text-slate-700"
              onClick={(event) => event.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isChecked}
                disabled={
                  isUpdating ||
                  !onToggleModel ||
                  Number.isNaN(detailId) ||
                  Number.isNaN(productId)
                }
                className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600"
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  const nextChecked = event.target.checked;
                  console.log('model click', {
                    issueKey,
                    baseDetailId,
                    detailId,
                    productId,
                    nextChecked,
                  });
                  setModelCheckedMap((prev) => ({ ...prev, [key]: nextChecked }));
                  if (!Number.isNaN(productId)) {
                    onToggleModel?.(
                      baseDetailId,
                      Number.isNaN(detailId) ? null : detailId,
                      productId,
                      issueKey,
                      nextChecked,
                    );
                  }
                }}
              />
              <span className="whitespace-nowrap">{item.name}</span>
            </label>
          );
        })}
      </div>
    );
  };

  const renderPublishList = (
    items: Array<{
      name: string;
      is_publish?: number | boolean;
      detail_id?: number | null;
      product_id?: number | string;
    }>,
    issueKey: string,
    baseDetailId: number,
  ) => {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isPublished = Number(item?.is_publish) === 1;
          const isChecked = isPublished;
          const detailId = Number(item?.detail_id);
          const productId = Number(item?.product_id);
          const hasDetail = Number.isFinite(detailId) && detailId > 0;
          const isUpdating = publishingIds.includes(detailId);

          return (
            <label
              key={`publish-${item.name}`}
              className="inline-flex items-center gap-1 text-sm text-slate-700"
              onClick={(event) => event.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isChecked}
                disabled={
                  isUpdating ||
                  (!onTogglePublish && !onToggleModel) ||
                  (!hasDetail && Number.isNaN(productId))
                }
                className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600"
                onClick={(event) => event.stopPropagation()}
                onChange={async (event) => {
                  const nextChecked = event.target.checked;
                  const nextPublish = nextChecked;
                  if (hasDetail) {
                    onTogglePublish?.(detailId, nextPublish);
                    return;
                  }

                  if (!Number.isNaN(productId) && onToggleModel) {
                    const createdId = await onToggleModel(
                      baseDetailId,
                      null,
                      productId,
                      issueKey,
                      nextChecked,
                    );
                    if (createdId) {
                      onTogglePublish?.(createdId, nextPublish);
                    }
                  }
                }}
              />
              <span className="whitespace-nowrap">{item.name}</span>
            </label>
          );
        })}
      </div>
    );
  };

  const renderSingleModel = (row: RowData) => {
    const productId = Number(row?.product_id);
    const issueKey = row?.issue_key ?? '';
    const key = row?.id
      ? `detail-${row.id}`
      : `issue-${issueKey}-product-${Number.isNaN(productId) ? row?.product_name ?? '' : productId}`;
    const isChecked = modelCheckedMap[key] ?? true;
    const detailId = Number(row?.id);
    const isUpdating = modelUpdatingIds.includes(detailId);

    return (
      <label
        className="inline-flex items-center gap-2 text-sm text-slate-700"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isChecked}
          disabled={
            isUpdating ||
            !onToggleModel ||
            Number.isNaN(detailId) ||
            Number.isNaN(productId)
          }
          className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600"
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            const nextChecked = event.target.checked;
            setModelCheckedMap((prev) => ({ ...prev, [key]: nextChecked }));
            if (!Number.isNaN(detailId) && !Number.isNaN(productId)) {
              onToggleModel?.(detailId, detailId, productId, issueKey, nextChecked);
            }
          }}
        />
        <span className="whitespace-nowrap">{row?.product_name}</span>
      </label>
    );
  };

  const renderSinglePublish = (row: RowData) => {
    const isPublished = Number(row?.is_publish) === 1;
    const isChecked = isPublished;
    const detailId = Number(row?.id);
    const isUpdating = publishingIds.includes(detailId);

    return (
      <label className="inline-flex items-center gap-2 text-sm text-slate-700" onClick={(event) => event.stopPropagation()}>
        <input
          type="checkbox"
          checked={isChecked}
          disabled={isUpdating || !onTogglePublish || Number.isNaN(detailId)}
          className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600"
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            const nextChecked = event.target.checked;
            const nextPublish = nextChecked;
            if (!Number.isNaN(detailId)) {
              onTogglePublish?.(detailId, nextPublish);
            }
          }}
        />
        <span className="whitespace-nowrap">{row?.product_name}</span>
      </label>
    );
  };
  
  const scrollFilters = (direction: 'left' | 'right') => {
    const container = filterScrollRef.current;
    if (!container) return;
    const delta = direction === 'left' ? -220 : 220;
    container.scrollBy({ left: delta, behavior: 'smooth' });
  };
  
  const updateFilterScrollState = () => {
    const container = filterScrollRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const hasOverflow = scrollWidth > clientWidth + 1;
    setShowFilterArrows(hasOverflow);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    updateFilterScrollState();
    const container = filterScrollRef.current;
    if (!container) return;

    const handleScroll = () => updateFilterScrollState();
    container.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateFilterScrollState());
      resizeObserver.observe(container);
    }

    const handleWindowResize = () => updateFilterScrollState();
    window.addEventListener('resize', handleWindowResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleWindowResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [filterOptionsDevices, filterOptionsModels]);


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
          <div className="overflow-x-auto">
            <div className='min-w-[900px]'>
              {/* Filter Section: modern responsive pill-style filters */}
              {(filterOptionsDevices && filterOptionsDevices.length > 0) ||
              (filterOptionsModels && filterOptionsModels.length > 0) ? (
                <div
                  // wrapper for the filter area with subtle divider
                  className="pb-3 mb-3"
                  style={{ borderBottom: `1px solid ${COLORS.border}` }}
                >
                  {/* relative container to position scroll arrows */}
                  <div className="relative">
                    {/* left arrow button shown when overflow exists */}
                    {showFilterArrows && (
                      <button
                        type="button"
                        aria-label="Scroll filters left"
                        onClick={() => scrollFilters('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm border"
                        style={{ borderColor: COLORS.border, opacity: canScrollLeft ? 1 : 0.35 }}
                        disabled={!canScrollLeft}
                      >
                        {/* left chevron icon */}
                        <ChevronLeft size={18} />
                      </button>
                    )}

                    {/* right arrow button shown when overflow exists */}
                    {showFilterArrows && (
                      <button
                        type="button"
                        aria-label="Scroll filters right"
                        onClick={() => scrollFilters('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm border"
                        style={{ borderColor: COLORS.border, opacity: canScrollRight ? 1 : 0.35 }}
                        disabled={!canScrollRight}
                      >
                        {/* right chevron icon */}
                        <ChevronRight size={18} />
                      </button>
                    )}

                    {/* scrolling container for filter pills; responsive padding */}
                    <div
                      ref={filterScrollRef}
                      className="overflow-x-auto scrollbar-hide px-4 sm:px-10 py-2"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                      <div className="space-y-3">
                          {/* <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">Device</span>
                            <div className="h-px flex-1 bg-amber-100" />
                          </div> */}
                        <div className="flex items-center gap-3 whitespace-nowrap overflow-x-auto pb-1">
                          {filterOptionsDevices?.map((filter) => (
                            <button
                              key={`device-${filter}`}
                              onClick={() => onDeviceFilterChange?.(filter)}
                              className="flex items-center gap-2 py-1.5 px-3 rounded-md transition-transform duration-150 text-sm font-medium flex-shrink-0 shadow-sm hover:scale-[1.02]"
                              style={{
                                background: selectedDeviceFilter === filter ? '#EAB308' : 'transparent',
                                color: selectedDeviceFilter === filter ? '#fff' : COLORS.text,
                                border: selectedDeviceFilter === filter ? `1px solid #EAB308` : `1px solid ${COLORS.border}`,
                              }}
                            >
                              {filter}
                            </button>
                          ))}
                        </div>

                        {filterOptionsModels && filterOptionsModels.length > 0 && (
                          <>
                            {/* <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Model</span>
                              <div className="h-px flex-1 bg-emerald-100" />
                            </div> */}
                            <div className="flex items-center gap-3 whitespace-nowrap overflow-x-auto pb-1">
                              {filterOptionsModels.map((filter) => (
                                <button
                                  key={`model-${filter}`}
                                  onClick={() => onModelFilterChange?.(filter)}
                                  className="flex items-center gap-2 py-1.5 px-3 rounded-md transition-transform duration-150 text-sm font-medium flex-shrink-0 shadow-sm hover:scale-[1.02]"
                                  style={{
                                    background: selectedModelFilter === filter ? '#16A34A' : 'transparent',
                                    color: selectedModelFilter === filter ? '#fff' : COLORS.text,
                                    border: selectedModelFilter === filter ? `1px solid #16A34A` : `1px solid ${COLORS.border}`,
                                  }}
                                >
                                  {filter}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Header Section: modern frosted header with responsive layout */}
              <div
                // header wrapper with subtle divider and backdrop blur for a modern look
                className="pb-3"
                style={{ borderBottom: `1px solid ${COLORS.border}` }}
              >
                {/* Column Headers row - uses a light frosted background and shadow */}
                <div className="flex items-center gap-2 py-2 px-2 sm:px-0 bg-white/60 backdrop-blur-sm rounded-md shadow-sm">
                  {safeColumns.map((column) => (
                    <div
                      // each header cell; width and alignment are preserved from config
                      key={column.id}
                      className={`${column.width || 'flex-1'} px-2 sm:px-4`}
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {column.sortable !== false ? (
                        <button
                          // clickable sortable header
                          onClick={() => handleRequestSort(column.id)}
                          className={`flex items-center gap-2 w-full ${TYPOGRAPHY.headerSize} ${TYPOGRAPHY.headerWeight} text-left`}
                          style={{
                            justifyContent: column.align === 'right' ? 'flex-end' : 'flex-start',
                            color: COLORS.text,
                            cursor: 'pointer',
                          }}
                        >
                          {/* header label */}
                          <span className="truncate">{column.label}</span>
                          {/* sort icon (faint when not active) */}
                          <span className="flex-shrink-0">{renderSortIcon(column.id)}</span>
                        </button>
                      ) : (
                        <span className={`${TYPOGRAPHY.headerSize} ${TYPOGRAPHY.headerWeight}`} style={{ color: COLORS.text }}>
                          {/* non-sortable header label */}
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
                    const isSelected = selectedRowId === row.id;

                    return (
                      <div 
                        key={row.id} 
                        onClick={() => handleRowClick(row)}
                        onMouseEnter={() => setHoveredRow(row.id)} 
                        onMouseLeave={() => setHoveredRow(null)} 
                        className={`flex items-center ${SPACING.rowPadding} ${RADIUS.row} cursor-pointer border-b transition-all duration-200`}
                        style={{ 
                          background: isSelected ? COLORS.selected : isHovered ? COLORS.surfaceHover : 'transparent',
                          borderColor: COLORS.border
                        }}
                      > 
                        {/* Dynamic Columns */}
                        {safeColumns.map((column) => {
                          return (
                            <div 
                              key={column.id}
                              className={`${column.width || 'flex-1'} truncate px-4`}
                              style={{ 
                                textAlign: column.align || 'left',
                                position: 'relative'
                              }}
                            >
                              {column.id === 'product_name' ? (
                                Array.isArray(row.product_name) ? (
                                  renderModelList(row.product_name, row.issue_key ?? '', Number(row.id))
                                ) : (
                                  renderSingleModel(row)
                                )
                              ) : column.id === 'is_publish' ? (
                                Array.isArray(row.publish_list) ? (
                                  renderPublishList(row.publish_list, row.issue_key ?? '', Number(row.id))
                                ) : (
                                  renderSinglePublish(row)
                                )
                              ) : column.id === 'created_at' ? (
                                <span className={`${TYPOGRAPHY.dateSize} ${TYPOGRAPHY.dateWeight}`}>
                                  {formatDate(row.created_at)}
                                </span>
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
