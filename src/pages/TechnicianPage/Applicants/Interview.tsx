import React, { useMemo, useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { interviewList, applicantUpdateStatus } from '../../../services/Technician/applicantServices'
import { userAuth } from '../../../hooks/userAuth'
import TableInterview from './components/TableInterview'
import AlertDialogRejected from '../../../components/feedback/AlertDialogRejected'
import Breadcrumb from '../../../components/Navigation/Breadcrumbs'
import CustomSearchField from '../../../components/Fields/CustomSearchField'

interface StatusUpdatePayload {
  id: number
  status: string
  remarks?: string
}

const Interview = () => {
  const queryClient = useQueryClient()
  const { setSnackBarMessage, setSnackBarOpen, setSnackBarType } = userAuth()

  const [searchValue, setSearchValue] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [updatingRowId, setUpdatingRowId] = useState<number | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [pendingRejectPayload, setPendingRejectPayload] = useState<StatusUpdatePayload | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['interview-list'],
    queryFn: interviewList,
  })

  const interviews = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data])

  const updateStatusApplicantMutate = useMutation({
    mutationFn: applicantUpdateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-list'] })
      setSnackBarMessage('Applicant status updated successfully.')
      setSnackBarType('success')
      setSnackBarOpen(true)
    },
    onError: (error: any) => {
      const rawMessage = error?.response?.data?.message || 'Failed to update applicant status.'
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, '')
      setSnackBarMessage(cleanMessage)
      setSnackBarType('error')
      setSnackBarOpen(true)
    },
    onSettled: () => {
      setUpdatingRowId(null)
      setRejectDialogOpen(false)
      setPendingRejectPayload(null)
    },
  })

  const submitStatusUpdate = (payload: StatusUpdatePayload) => {
    setUpdatingRowId(payload.id)
    updateStatusApplicantMutate.mutate(payload)
  }

  const handleStatusApplicantChange = ({
    id,
    status,
    currentStatus,
  }: {
    id: number
    status: string
    currentStatus?: string
  }) => {
    if (!status || status === currentStatus) return

    if (status === 'REJECTED') {
      setPendingRejectPayload({ id, status })
      setRejectDialogOpen(true)
      return
    }

    submitStatusUpdate({ id, status })
  }

  const handleRejectedSubmit = (remarks?: string) => {
    if (!pendingRejectPayload) return

    submitStatusUpdate({
      ...pendingRejectPayload,
      remarks: remarks?.trim() || '',
    })
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchValue)
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const filteredApplicant = useMemo(() => {
    if (!debouncedSearch?.trim()) return interviews

    return interviews.filter((u: any) =>
        u.full_name.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
        u.position.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
        u.schedule_date.toLowerCase().includes(debouncedSearch?.toLowerCase()) 
    )
  }, [interviews, debouncedSearch]);

  const columns = [
    { id: 'full_name', label: 'Name', sortable: true, align: 'left' as const },
    { id: 'position', label: 'Job Position', sortable: true, align: 'left' as const },
    { id: 'schedule_date', label: 'Interview Date', sortable: true, align: 'left' as const },
    { id: 'status', label: 'Confirmation', sortable: true, align: 'center' as const },
    { id: 'status_applicant', label: 'Status', sortable: true, align: 'left' as const },
    { id: 'user_full_name', label: 'Scheduled By', sortable: true, align: 'left' as const },
    { id: 'created_at', label: 'Date Created', sortable: true, align: 'left' as const },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-white">
      <AlertDialogRejected
        open={rejectDialogOpen}
        title="Reject Applicant"
        message="Please provide a remark before marking this applicant as rejected."
        onClose={() => {
          if (updateStatusApplicantMutate.isPending) return
          setRejectDialogOpen(false)
          setPendingRejectPayload(null)
        }}
        onSubmit={handleRejectedSubmit}
        isLoading={updateStatusApplicantMutate.isPending}
        showRemarks={true}
        remarksRequired={true}
        remarksLabel="Rejection Note"
        remarksPlaceholder="Why is this applicant rejected?"
      />
      <div className="flex justify-between ">
        {/* Breadcrumb */}
        <div className="flex items-center w-full">
            <Breadcrumb 
                items={[
                    { label: 'Interview Schedule', isActive: true, icon: <ClipboardList /> }
                ]}
            />
        </div>

        <div className='w-full max-w-72'>   
            <CustomSearchField 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder='Search by name...'
                className='w-full'
            />
        </div>
      </div> 

      <TableInterview
        rows={filteredApplicant}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onStatusApplicantChange={handleStatusApplicantChange}
        updatingRowId={updatingRowId}
      />
    </div>
  )
}

export default Interview
