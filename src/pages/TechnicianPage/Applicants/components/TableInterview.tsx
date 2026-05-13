import React, { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  CalendarClock,
  Check,
  X
} from 'lucide-react'
import CustomSelectField from '../../../../components/Fields/CustomSelectField'
import { getAllJobPosting } from '../../../../services/Technician/careersServices'
import { useQuery } from '@tanstack/react-query'
import ApplicantsDialog from './ApplicantsDialog'
import { sendInterviewInvitation, applicantAttendanceStatus } from '../../../../services/Technician/applicantServices'
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

const SPACING = {
  containerPadding: 'p-3 md:p-4',
  rowPadding: 'py-2.5 px-3', 
}

const RADIUS = {
  container: 'rounded-lg',
  button: 'rounded-md',
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
      const canReschedule = row.status !== 'Pending' && row.status_applicant === 'SHORTLISTED'

      return (
        <div className="flex items-center gap-3 min-w-0">
          {canReschedule ? (
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 hover:shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              onClick={(e) => {
                e.stopPropagation()
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
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                downloadFile(row.attachment_url, 'view')
              }}
              className="block max-w-[220px] truncate text-left text-sm font-medium text-gray-900 hover:underline"
              title={String(row[column.id] ?? '')}
            >
              {row[column.id]}
            </button> 
          </div>
        </div>
      )
    }
    
    if (column.id === 'schedule_date') {
      const scheduleTime = row.time || "—" // formatTime(row.schedule_date)

      return (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900">{formatDate(row.schedule_date)}</span>
          <span className="text-xs text-gray-500">{scheduleTime}</span>
        </div>
      )
    }

    if (column.id === 'created_at') {
      return (
        <span className="text-sm text-gray-500">
          {formatDate(row[column.id])}
        </span>
      )
    }   

    if (column.id === 'status') {
      const { label, classes } = getStatusConfig(row.status)
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
          {label}
        </span>
      )
    }

    if (column.id === 'is_already_responded') {
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
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
              { value: 'NEW_APPLICANT', label: 'NEW_APPLICANT' },
              { value: 'SHORTLISTED', label: 'SHORTLISTED' },
              { value: 'REJECTED', label: 'REJECTED' },
              { value: 'HIRED', label: 'HIRED' },
              { value: 'CLOSED', label: 'CLOSED' },
              { value: 'INTERVIEWED', label: 'INTERVIEWED' },
              { value: 'ASSESSMENT', label: 'ASSESSMENT' },
              { value: 'FOR_APPROVAL', label: 'FOR_APPROVAL' },
              { value: 'BACKGROUND_CHECK', label: 'BACKGROUND_CHECK' },
              { value: 'OFFER_STAGE', label: 'OFFER_STAGE' },
              { value: 'ONBOARDING', label: 'ONBOARDING' },
              { value: 'DECLINED_OFFER', label: 'DECLINED_OFFER' },
              { value: 'WITHDRAWN_INACTIVE', label: 'WITHDRAWN_INACTIVE' },  
            ]}
          />
          {updatingRowId === row.id && (
            <p className="mt-1 text-xs text-slate-500">Updating...</p>
          )}
        </div>
      )
    }

    if (column.id === 'is_attended') { 
 
      return (
        <div>
          <button
            type="button"
            disabled={updateApplicantAttendanceMutation.isPending}
            onClick={() => handleAttendanceToggle(row.applicants_id, "Yes")}
          >
            <Check />
          </button>
          <button
            type="button"
            disabled={updateApplicantAttendanceMutation.isPending}
            onClick={() => handleAttendanceToggle(row.applicants_id, "No")}
          >
            <X />
          </button>
        </div>
      )
    }




    return (
      <div className="text-sm text-gray-900 truncate max-w-[200px]">
        {row[column.id] ?? '-'}
      </div>
    )
  }

  
  const handleEmailSubmit = async (emailData: { 
    location: string;
    time: string[];
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

  const updateApplicantAttendanceMutation = useMutation({
    mutationFn: applicantAttendanceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-list'] })
      setSnackBarMessage('Attendance status updated successfully.')
      setSnackBarType('success')
      setSnackBarOpen(true)
    },
    onError: (error: any) => {
      const rawMessage = error?.response?.data?.message || 'Failed to update attendance status.'
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, '')
      setSnackBarMessage(cleanMessage)
      setSnackBarType('error')
      setSnackBarOpen(true)
    },
  })

  const handleAttendanceToggle = (applicantId: number | string, attendanceStatus: 'Yes' | 'No') => {
    if (!applicantId) return
 
    updateApplicantAttendanceMutation.mutate(
      {
        id: applicantId,
        is_attended: attendanceStatus,
      }
    )
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
        <div className="w-full mx-auto p-4 md:p-6">
          <div
            className={`${RADIUS.container} ${SPACING.containerPadding} border flex flex-col items-center justify-center py-16`}
            style={{ background: COLORS.surface, borderColor: COLORS.border }}
          >
            <div className="rounded-full h-12 w-12 border-b-2 border-gray-900 animate-spin"></div>
            <p className="mt-4 text-sm" style={{ color: COLORS.textMuted }}>
              Loading interview schedules...
            </p>
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
        <div
          className={`${RADIUS.container} ${SPACING.containerPadding} border p-4 mb-4`}
          style={{ background: COLORS.surface, borderColor: COLORS.border }}
        >
          <div className="border-b">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap">
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
                      className={`py-2 px-4 border-b transition text-sm font-medium ${
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

              <div className="w-full pb-3 lg:w-[280px] lg:pb-0">
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
          </div>
          <div className="overflow-x-auto p-3">
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
                          {column.sortable !== false && orderBy === column.id && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
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
                            className={`px-4 py-3 align-middle ${
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
              <span className="text-xs text-gray-500">
                {filteredRows.length > 0 ? `${startIndex}-${endIndex} of ${filteredRows.length}` : '0 items'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || filteredRows.length === 0}
                  className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
