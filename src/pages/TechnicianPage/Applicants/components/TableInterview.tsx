import React, { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  CalendarClock
} from 'lucide-react'
import CustomSelectField from '../../../../components/Fields/CustomSelectField'
import { getAllJobPosting } from '../../../../services/Technician/careersServices'
import { useQuery } from '@tanstack/react-query'
import ApplicantsDialog from './ApplicantsDialog'
import { sendInterviewInvitation } from '../../../../services/Technician/applicantServices'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userAuth } from '../../../../hooks/userAuth'
import { downloadFile } from "../../../../utils/downloadFile"

const COLORS = {
  background: '#ffffff',
  surface: '#ffffff',
  surfaceHover: '#f9fafb',
  border: '#e5e7eb',
  text: '#111827',
  textMuted: '#6b7280',
}

const TYPOGRAPHY = {
  headerSize: 'text-sm',
  headerWeight: 'font-medium',
  dateSize: 'text-xs',
}

const SPACING = {
  containerPadding: 'p-4',
  rowPadding: 'py-2.5 px-3',
}

const RADIUS = {
  container: 'rounded-lg',
  row: 'rounded-md',
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  Confirmed: {
    label: 'Confirmed',
    classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  Pending: {
    label: 'Pending',
    classes: 'bg-slate-100 text-slate-700 border border-slate-200',
  },
  Cancelled: {
    label: 'Cancelled',
    classes: 'bg-red-100 text-red-700 border border-red-200',
  },
}

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? {
    label: status || 'Unknown',
    classes: 'bg-slate-100 text-slate-700 border border-slate-200',
  }

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatTime = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

type Order = 'asc' | 'desc'

const getTimestamp = (value?: string | null) => {
  if (!value) return Number.NEGATIVE_INFINITY

  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp
}

const compareStrings = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' })

function compareRowValues(a: RowData, b: RowData, orderBy: string) {
  const aValue = a[orderBy]
  const bValue = b[orderBy]

  if (orderBy === 'schedule_date' || orderBy === 'created_at' || orderBy === 'updated_at') {
    return getTimestamp(String(aValue ?? '')) - getTimestamp(String(bValue ?? ''))
  }

  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return aValue - bValue
  }

  if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
    return Number(aValue) - Number(bValue)
  }

  return compareStrings(String(aValue ?? ''), String(bValue ?? ''))
}

function getComparator<T extends RowData>(
  order: Order,
  orderBy: string,
  rowOrderMap: Map<number, number>,
) {
  return (a: T, b: T) => {
    const primaryDiff = compareRowValues(a, b, orderBy)

    if (primaryDiff !== 0) {
      return order === 'asc' ? primaryDiff : -primaryDiff
    }

    const aIndex = rowOrderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER
    const bIndex = rowOrderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER

    return aIndex - bIndex
  }
}

interface RowData {
  id: number
  email?: string
  full_name?: string
  [key: string]: any
}

interface ColumnConfig {
  id: string
  label: string
  sortable?: boolean
  width?: string
  align?: string
}

interface TableInterviewProps {
  rows: RowData[]
  columns: ColumnConfig[]
  isLoading: boolean
  isError?: boolean
  onStatusApplicantChange?: (payload: { id: number; status: string; currentStatus?: string }) => void
  updatingRowId?: number | null
}

interface ApplicantsDialog {
  applicantName: string;
  applicantEmail: string;
  applicantPosition: string;
  applicantId?: string;
}

export default function TableInterview({
  rows = [],
  columns = [],
  isLoading = false,
  isError = false,
  onStatusApplicantChange,
  updatingRowId = null,
}: TableInterviewProps) {

  const { 
    userInfo, 
    setSnackBarMessage, 
    setSnackBarType, 
    setSnackBarOpen 
  } = userAuth();
  const queryClient = useQueryClient();
  const [emailDialogOpen, setEmailDialogOpen] = useState<boolean>(false);
  const [page, setPage] = useState(0)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [order, setOrder] = useState<Order>('desc')
  const [orderBy, setOrderBy] = useState<string>('schedule_date')
  const [statusFilter, setStatusFilter] = useState('All')
  const [jobCategory, setJobCategory] = useState('')
  const rowsPerPage = 20

  const [formData, setFormData] = useState<ApplicantsDialog>({
    applicantName: '',
    applicantEmail: '',
    applicantPosition: "",
    applicantId: ''
  });

  const { mutateAsync: sendInterviewInvitations } = useMutation({
    mutationFn: sendInterviewInvitation
  })

  const safeRows = Array.isArray(rows) ? rows : []

  const { data: jobResponse } = useQuery({
    queryKey: ['job-listing'],
    queryFn: getAllJobPosting,

  })

  const jobOptions = useMemo(() => {
    const jobList = Array.isArray(jobResponse?.data) ? jobResponse.data : []

    return [
      { value: '', label: 'All' },
      ...jobList.map((job: any) => ({
        value: String(job.title ?? ''),
        label: String(job.title ?? ''),
      })),
    ]
  }, [jobResponse])

  const filteredRows = useMemo(() => {
    return safeRows.filter((row) => {
      const matchesStatus =
        statusFilter === 'All' ? true : row.status === statusFilter
      const matchesJob =
        jobCategory.trim() === ''
          ? true
          : String(row.position ?? '').toLowerCase() === jobCategory.toLowerCase()

      return matchesStatus && matchesJob
    })
  }, [safeRows, statusFilter, jobCategory])

  const rowOrderMap = useMemo(
    () => new Map(safeRows.map((row, index) => [row.id, index])),
    [safeRows],
  )

  const handleRequestSort = (property: string) => {
    setOrder((prevOrder) => {
      if (orderBy !== property) {
        return 'asc'
      }

      return prevOrder === 'asc' ? 'desc' : 'asc'
    })
    setOrderBy(property)
  }

  const sortedRows = useMemo(() => {
    if (filteredRows.length === 0) return []

    if (orderBy === 'schedule_date' && order === 'desc') {
      return filteredRows
    }

    return [...filteredRows].sort(getComparator(order, orderBy, rowOrderMap))
  }, [filteredRows, order, orderBy, rowOrderMap])

  const visibleRows = sortedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage)
  const startIndex = filteredRows.length > 0 ? page * rowsPerPage + 1 : 0
  const endIndex = Math.min((page + 1) * rowsPerPage, filteredRows.length)

  const renderCell = (row: RowData, column: ColumnConfig) => {

    if (column.id === 'full_name') {
      return (
         <button
          type="button"
          onClick={() => downloadFile(row.attachment_url, 'view')}
          className="truncate text-left text-sm text-gray-900 hover:underline"
         >
          {row[column.id]}
        </button>
      )
    }
    
    if (column.id === 'schedule_date') {
      const scheduleTime = row.time || "—" // formatTime(row.schedule_date)

      return (
        <div className="flex flex-col">
          <span className="text-sm text-slate-900">{formatDate(row.schedule_date)}</span>
          <span className="text-xs text-slate-500">{scheduleTime}</span>
        </div>
      )
    }

    if (column.id === 'created_at') {
      return (
        <div className='flex gap-2 items-center'>
          <span className="text-sm text-slate-900">
            {formatDate(row[column.id])}
          </span>

          {row.status === 'Cancelled' && row.status_applicant === 'SHORTLISTED' && (
            <button 
              className='bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 hover:shadow-xl hover:scale-105 p-2 rounded-md'
              onClick={() => handleDisplayDialog(row.id)}
              title='Reschedule'
            >
              <CalendarClock className='w-4 h-4' />
            </button>
          )}
        </div>
      )
    }   

    if (column.id === 'status') {
      const { label, classes } = getStatusConfig(row.status)
      return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${classes}`}>{label}</span>
    }

    if (column.id === 'is_already_responded') {
      return (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            row.is_already_responded === 1
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {row.is_already_responded === 1 ? 'Yes' : 'No'}
        </span>
      )
    }

    if (column.id === 'status_applicant') {
      return (
        <div className="min-w-[100px]">
          <CustomSelectField
            name={`status_applicant_${row.id}`}
            placeholder="Select status"
            value={row.status_applicant || ''}
            onChange={(e) =>
              onStatusApplicantChange?.({
                id: row.applicants_id,
                status: String(e.target.value),
                currentStatus: row.status_applicant,
              })
            }
            options={[
              { value: 'SHORTLISTED', label: 'SHORTLISTED' },
              { value: 'HIRED', label: 'HIRED' },
              { value: 'REJECTED', label: 'REJECTED' },
            ]}
          />
          {updatingRowId === row.id && (
            <p className="mt-1 text-xs text-slate-500">Updating...</p>
          )}
        </div>
      )
    }

    return <span className="text-sm text-slate-900">{row[column.id] ?? '-'}</span>
  }

  const handleEmailSubmit = async (emailData: { 
    location: string;
    time: string;
    date: string;
    schedule: string;
    format: string
  }) => {
    const payload = {
      id: formData.applicantId,
      name: formData.applicantName,
      position:formData.applicantPosition,
      email: formData.applicantEmail, 
      location: emailData.location,
      time: emailData.time,
      date: emailData.date,
      schedule_details: emailData.schedule,
      format: emailData.format,
      duration: "60",
      user_id: userInfo?.id
    };

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
      setSnackBarMessage(cleanMessage);
      setSnackBarType(error);
      setSnackBarOpen(true);
    }
  }

  // open display dialog 
  const handleDisplayDialog = (id: number) => {
    const selectedRow = rows.find((row) => row.id === id)
 
    if (!selectedRow ) return

    setFormData((prev) => ({
      ...prev,
      applicantEmail: selectedRow.email || '',
      applicantName: selectedRow.full_name || '',
      applicantPosition: selectedRow.position || '',
      applicantId: selectedRow.applicants_id || ""
    }))

    setEmailDialogOpen(true) 
  }

  if (isLoading) {
    return (
      <div className="w-full" style={{ background: COLORS.background }}>
        <div className="w-full mx-auto p-6">
          <div className={`${RADIUS.container} ${SPACING.containerPadding} border`} style={{ background: COLORS.surface, borderColor: COLORS.border }}>
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full h-12 w-12 border-b-2 border-gray-900 animate-spin"></div>
              <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
                Loading interview schedules...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full" style={{ background: COLORS.background }}>

      {/* Email Dialog */}
      <ApplicantsDialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        onSubmit={handleEmailSubmit}
        applicantName={formData.applicantName}
        applicantEmail={formData.applicantEmail}
      />

      <div className="w-full mx-auto">
        <div className={`${RADIUS.container} ${SPACING.containerPadding} border`} style={{ background: COLORS.surface, borderColor: COLORS.border }}>
          <div className="flex flex-col lg:flex-row    lg:justify-between">
            <div className="flex flex-wrap ">
              {['All', 'Pending', 'Confirmed', 'Cancelled'].map((status) => {
                const isActive = statusFilter === status

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setStatusFilter(status)
                      setPage(0)
                    }}
                    className={`border-b px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-yellow-500 border-yellow-500'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                )
              })}
            </div>

            <div className="w-full lg:w-[280px]">
              <CustomSelectField 
                name='job_category'
                placeholder='Filter by job position'
                value={jobCategory}
                onChange={(e) => {
                  setJobCategory(e.target.value)
                  setPage(0)
                }}
                options={jobOptions}
              />
            </div>
          </div>
          <div className="overflow-x-auto border-t border-gray-200 p-3">
            {isError ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Mail size={48} style={{ color: COLORS.textMuted }} strokeWidth={1.5} />
                <p className="mt-4 text-sm text-red-600">Unable to load interview schedules.</p>
              </div>
            ) : visibleRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Mail size={48} style={{ color: COLORS.textMuted }} strokeWidth={1.5} />
                <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
                  No interview schedule records found.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.id}
                        className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 ${
                          column.align === 'right' ? 'text-right' : 'text-left'
                        } ${column.sortable !== false ? 'cursor-pointer select-none' : ''}`}
                        onClick={() => column.sortable !== false && handleRequestSort(column.id)}
                      >
                        <div
                          className={`flex items-center gap-2 ${
                            column.align === 'right' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span>{column.label}</span>
                          {column.sortable !== false && orderBy === column.id && order === 'asc' && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {visibleRows.map((row) => {
                    const isHovered = hoveredRow === row.id

                    return (
                      <tr
                        key={row.id}
                        onMouseEnter={() => setHoveredRow(row.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className="transition-all duration-200"
                        style={{
                          background: isHovered ? COLORS.surfaceHover : 'transparent',
                        }}
                      >
                        {columns.map((column) => (
                          <td
                            key={column.id}
                            className={`px-4 py-2 align-middle ${
                              column.align === 'right' ? 'text-right' : 'text-left'
                            }`}
                          >
                            {renderCell(row, column)}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="w-full flex justify-end mt-4 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-6">
              <span className={`${TYPOGRAPHY.dateSize}`} style={{ color: COLORS.textMuted }}>
                {filteredRows.length > 0 ? `${startIndex}-${endIndex} of ${filteredRows.length}` : '0 items'}
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
                  disabled={page === totalPages - 1 || filteredRows.length === 0}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    opacity: page === totalPages - 1 || filteredRows.length === 0 ? 0.3 : 1,
                    cursor: page === totalPages - 1 || filteredRows.length === 0 ? 'not-allowed' : 'pointer',
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
  )
}
