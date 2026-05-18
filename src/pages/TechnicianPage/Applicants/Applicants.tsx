import React, { useState, useEffect, useMemo } from 'react'
import {    
  fetchApplicants,
  fetchApplicantsShortList,
  fetchApplicantsRejected,
  fetchApplicantsClosed,
  fetchApplicantsNewApplicants,
  fetchApplicantsHired,
  applicantMode,
  APPLICANT_MODE_STATUSES,
  shortList,
  deleteApplicants,
  rejectedApplicants,
  undoRejectedApplicants,
  closedApplicants,
  jobDetails
} from '../../../services/Technician/applicantServices'
import type { ApplicantModeStatus } from '../../../services/Technician/applicantServices'
import { downloadFile } from '../../../utils/downloadFile';
import {   
  X,
  Undo,
  Trash2, 
  Plus, 
  Eye,
  MailX,
  ArrowLeftToLine
} from 'lucide-react'; 
import { useSearchParams } from 'react-router-dom';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query' 
import Breadcrumb from '../../../components/Navigation/Breadcrumbs'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import TableApplicants from './components/TableApplicants'; 
import CustomSearchField from "../../../components/Fields/CustomSearchField";
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens' 
import { userAuth } from "../../../hooks/userAuth"
import AlertDialogRejected from '../../../components/feedback/AlertDialogRejected'; 
import { useParams, useNavigate } from 'react-router-dom';

const isApplicantModeStatus = (status: string): status is ApplicantModeStatus =>
  APPLICANT_MODE_STATUSES.includes(status as ApplicantModeStatus);

const Applicants = () => { 
  const queryClient = useQueryClient(); 
  const navigate = useNavigate();

  const columns = [ 
    { id: 'full_name', label: 'Name', sortable: true },
    { id: 'phone', label: 'Phone', sortable: true },
    { id: "email", label: 'Email', sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: 'created_at', label: "Date Applied", sortable: true}
  ] 

  const { 
    userInfo,
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
  } = userAuth()
   
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [shortListedId, setShortListedId] = useState<number[]>([]);
  const [deleteIds, setDeleteIds] = useState<number[]>([])
  const [rejectedId, setRejectedId] = useState<number[]>([])
  const [closedId, setClosedId] = useState<number[]>([])
  const [undoId, setUndoId] = useState('')
  const [dataValue, setDataValue] = useState<string>('')
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([])
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page") || 0);
  const [applicantsPage, setApplicantsPage] = useState<number>(
    Number.isFinite(initialPage) && initialPage >= 0 ? initialPage : 0
  );
  const [statusFilter, setStatusFilterState] = useState<string>(
    searchParams.get("tab") || "all"
  );

  const { id } = useParams()

  const { 
    data:applicantPendingResponse, 
    isLoading: isPendingLoading, 
    error: pendingError 
  } = useQuery({
    queryKey: ["all-applicant",id],
    queryFn: () => fetchApplicants(String(id)),
    enabled: !!id,
  });

  const {
    data: jobDetailsResponse
  } = useQuery ({
    queryKey: ['job-details', id],
    queryFn: () => jobDetails(String(id))
  })
      
  const { 
    data: applicantShortListedResponse, 
    isLoading: isCompletedLoading, 
    error: completedError 
  } = useQuery({
    queryKey: ["short-listed",id],
    queryFn: () => fetchApplicantsShortList(String(id)),
    enabled: !!id,
  });

  const {
    data: applicantsRejectedResponse,
    isLoading: isRejectedLoading,
  } = useQuery ({
    queryKey: ['rejected', id],
    queryFn: () => fetchApplicantsRejected(String(id)),
    enabled: !!id,
  });

  const {
    data: applicantsNewApplicantResponse,
    isLoading: isNewApplicantLoading,
  } = useQuery ({
    queryKey: ['new-applicant', id],
    queryFn: () => fetchApplicantsNewApplicants(String(id)),
    enabled: !!id,
  });

  const {
    data: closedApplicantsResponse,
    isLoading: isClosedLoading,
  } = useQuery ({
    queryKey: ['closed', id],
    queryFn: () => fetchApplicantsClosed(String(id)),
    enabled: !!id,
  });

  const {
    data: hiredApplicantsResponse,
    isLoading: isHiredLoading
  } = useQuery ({
    queryKey: ['hired', id],
    queryFn: () => fetchApplicantsHired(String(id)),
    enabled: !!id,
  })

  const {
    data: applicantModeResponse,
    isLoading: isApplicantModeLoading,
  } = useQuery({
    queryKey: ['applicant-mode', id, statusFilter],
    queryFn: () => applicantMode({
      job_applicant: String(id),
      status: statusFilter,
    }),
    enabled: !!id && isApplicantModeStatus(statusFilter),
  })

  const { mutateAsync: shortListed, isPending: isShortListing } = useMutation({
    mutationFn: shortList
  });

  const { mutateAsync: deleteApplicante, isPending: isDeleting } = useMutation({
     mutationFn: deleteApplicants
  });

  const { mutateAsync: rejectApplicants, isPending: isRejecting } = useMutation({
    mutationFn: rejectedApplicants
  })

  const { mutateAsync: undoApplicant, isPending: isUndoing } = useMutation({
    mutationFn: undoRejectedApplicants
  });

  const { mutateAsync: closedApplicant, isPending: isClosing } = useMutation({
    mutationFn: closedApplicants
  });

  const isDialogLoading = dialogOpen && ((dataValue === 'delete' && isDeleting) || (dataValue === 'short-listed' && isShortListing) || (dataValue === 'undo' && isUndoing) || (dataValue === 'rejected' && isRejecting) || (dataValue === 'closed' && isClosing));

  const jobDetailed = jobDetailsResponse?.data || []
  
  const rows = useMemo(() => {
    let baseRows = [];

    if (statusFilter === "all") baseRows = applicantPendingResponse?.data || [];
    if (statusFilter === 'new_applicants') baseRows = applicantsNewApplicantResponse?.data || [];
    if (statusFilter === "short_listed") baseRows = applicantShortListedResponse?.data || [];
    if (statusFilter === 'rejected') baseRows = applicantsRejectedResponse?.data || [];
    if (statusFilter === 'hired') baseRows = hiredApplicantsResponse?.data || [];
    if (statusFilter === 'closed') baseRows = closedApplicantsResponse?.data || [];
    if (isApplicantModeStatus(statusFilter)) baseRows = applicantModeResponse?.data || [];

    // Remove duplicates based on unique identifier (e.g., id or pid)
    const uniqueRows = Array.from(
      new Map(baseRows.map(item => [item.id, item])).values()
    );

    return uniqueRows;
  }, [
    statusFilter, 
    applicantPendingResponse, 
    applicantsNewApplicantResponse, 
    applicantShortListedResponse, 
    applicantsRejectedResponse, 
    hiredApplicantsResponse,
    closedApplicantsResponse,
    applicantModeResponse
  ])

  const selectedRow = rows.find((r: any) => r.id === selectedRowId);
  const getActionIds = () => (
    checkedRowIds.length > 0
      ? checkedRowIds
      : selectedRowId
        ? [selectedRowId]
        : []
  );
  const getActionRows = () => {
    const ids = getActionIds();
    return rows.filter((row: any) => ids.includes(row.id));
  };

  // Handle View
  const handleView = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select an applicant first")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    if (selectedRow) {
      downloadFile(selectedRow.attachment_url, 'view', selectedRow.name);
    }
  }

  // Handle Add/Shortlist
  const handleAdd = () => {
    const ids = getActionIds();
    const actionRows = getActionRows();

    if (!selectedRowId) {
      setSnackBarMessage("Please select an applicant first")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }actionRows.some((row: any) => row.status === 'REJECTED')

    if (actionRows.some((row: any) => row.status !== 'NEW_APPLICANT')) {
      setSnackBarMessage("This action is only available for new applicants")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    setShortListedId(ids)
    setDataValue('short-listed')
    setDialogTitle("Confirm Short Listed");
    setDialogOpen(true);
    setDialogMessage("Are you sure you want to short list this applicant?");
  }

  // Handle Undo
  const handleUndo = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select an applicant first")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    if (selectedRow?.status !== 'SHORTLISTED' && selectedRow?.status !== 'REJECTED') {
      setSnackBarMessage("This action is only available for shortlisted or rejected applicants")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    setUndoId(String(selectedRowId));
    setDataValue('undo')
    setDialogTitle("Confirm Undo");
    setDialogOpen(true);
    setDialogMessage("Are you sure you want to undo this applicant?");
  }

  // Handle Reject (X)
  const handleReject = () => {
    const ids = getActionIds();
    const actionRows = getActionRows();

    if (ids.length === 0) {
      setSnackBarMessage("Please select at least one applicant")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    if (actionRows.some((row: any) => row.status === 'REJECTED')) {
      setSnackBarMessage("One or more selected applicants are already rejected")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    if (actionRows.some((row: any) => row.status === 'CLOSED')) {
      setSnackBarMessage("Closed applicants cannot be rejected")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    setRejectedId(ids);
    setDataValue('rejected')
    setDialogTitle("Confirm Rejected");
    setDialogOpen(true);
    setDialogMessage(`Are you sure you want to reject ${ids.length} applicant${ids.length > 1 ? 's' : ''}?`);
  }

  const handleClosed = () => {
    const ids = getActionIds();
    const actionRows = getActionRows();

    if (ids.length === 0) {
      setSnackBarMessage("Please select at least one applicant")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }
    if (actionRows.some((row: any) => row.status !== 'REJECTED')) {
      setSnackBarMessage("This action is only available for rejected applicants")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }
    setClosedId(ids);
    setDataValue('closed')
    setDialogTitle("Confirm Closed");
    setDialogOpen(true);
    setDialogMessage("Are you sure you want to mark this applicant as closed?");
  }

  // Handle Delete (Trash)
  const handleDelete = () => {
    const ids = getActionIds();
    const actionRows = getActionRows();

    if (ids.length === 0) {
      setSnackBarMessage("Please select at least one applicant")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    if (actionRows.some((row: any) => row.status !== 'REJECTED')) {
      setSnackBarMessage("This action is only available for rejected applicants")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }
    setDeleteIds(ids)
    setDataValue('delete')
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete ${ids.length} applicant${ids.length > 1 ? 's' : ''}?`)
  }

  const handleRowClick = (row: any) => {
    setSelectedRowId(row.id);
  }

  const handleBack = () => {
    navigate(`/beesee/job-posting`)
  }

  const handleRowDoubleClick = (row: any) => {
    navigate(`/beesee/job-posting/applicant/email/${row.pid}`, {
      state: {
        backTo: `/beesee/job-posting/applicants/${id}?tab=${statusFilter}&page=${applicantsPage}&selected=${row.id}`
      }
    })
  }

  const clearFormat = () => {
    setDataValue("")
    setDeleteIds([])
    setRejectedId([])
    setClosedId([])
    setUndoId("")
    setShortListedId("")
  }

  const handleConfirm = async (remarks?: string) => {
    try {
      if (dataValue === 'rejected' && !remarks?.trim()) {
        setSnackBarMessage('Please enter a rejection note.');
        setSnackBarType('warning');
        setSnackBarOpen(true);
        return;
      }

      let response;
      if (dataValue === 'delete') {
        response = await deleteApplicante({ ids: deleteIds, user_id: userInfo?.id });
      } else if (dataValue === 'short-listed') {
        response = await shortListed({ id: shortListedId, user_id: userInfo?.id });
      } else if (dataValue === 'undo') {
        response = await undoApplicant({ id: undoId, user_id: userInfo?.id });
      } else if (dataValue === 'rejected') {
        response = await rejectApplicants({ id: rejectedId, user_id: userInfo?.id, remarks: remarks?.trim() });
      } else if (dataValue === 'closed') {
        // For closed, we will also use the rejectApplicants mutation but with a different status
        response = await closedApplicant({ id: closedId, user_id: userInfo?.id });
      }

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        setSelectedRowId(null)
        setCheckedRowIds([])

        if (dataValue === 'delete') {
          setSnackBarMessage("Applicant deleted successfully");
        } else if (dataValue === 'short-listed') {
          setSnackBarMessage("Applicant short listed successfully");
        } else if (dataValue === 'undo') {
          setSnackBarMessage("Applicant undo successfully");
        } else if (dataValue === 'rejected') {
          setSnackBarMessage("Applicant rejected successfully");
        } else if (dataValue === 'closed') {
          setSnackBarMessage("Applicant marked as closed successfully");
        }
        
        setSnackBarType("success");
        setSnackBarOpen(true);

        // Refetch
        queryClient.invalidateQueries({ queryKey: ['all-applicant'] });
        queryClient.invalidateQueries({ queryKey: ["short-listed"]});
        queryClient.invalidateQueries({ queryKey: ['rejected']});
        queryClient.invalidateQueries({ queryKey: ['new-applicant']});
        queryClient.invalidateQueries({ queryKey: ['hired']});
        queryClient.invalidateQueries({ queryKey: ['closed']});
        queryClient.invalidateQueries({ queryKey: ['applicant-mode']});
        clearFormat()
      }
    } catch (error) {
      if (dataValue === 'delete') {  
        setSnackBarMessage("Failed to delete. Please try again.");
      } else if (dataValue === 'short-listed') { 
        setSnackBarMessage("Failed to short list. Please try again.");
      } else if (dataValue === 'undo') { 
        setSnackBarMessage("Failed to undo. Please try again.");
      } else if (dataValue === 'rejected') { 
        setSnackBarMessage("Failed to rejected. Please try again.");
      }

      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }

  const setStatusFilter = (tab: string) => {
    setStatusFilterState(tab);
    setApplicantsPage(0);
    setSelectedRowId(null);
    setCheckedRowIds([]);
    setSearchParams({ tab, page: '0' }, { replace: true})
  }

  const handleApplicantsPageChange = (page: number) => {
    setApplicantsPage(page);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', statusFilter);
    nextParams.set('page', String(page));

    if (selectedRowId) {
      nextParams.set('selected', String(selectedRowId));
    } else {
      nextParams.delete('selected');
    }

    setSearchParams(nextParams, { replace: true });
  }

  useEffect(() => {
    const selected = searchParams.get("selected");
    const pageParam = Number(searchParams.get("page") || 0);

    if (selected) {
      setSelectedRowId(Number(selected));
    }

    setApplicantsPage(Number.isFinite(pageParam) && pageParam >= 0 ? pageParam : 0);
  }, [searchParams])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const filteredInquiries = useMemo(() => {
    if (!debouncedSearch.trim()) return rows

    return rows.filter((i: any) => 
      i.job_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.phone?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.status?.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [rows, debouncedSearch])
 
  const isInitialLoading = isPendingLoading || isCompletedLoading
  const isTableLoading =
    (statusFilter === 'all' && isPendingLoading) ||
    (statusFilter === 'new_applicants' && isNewApplicantLoading) ||
    (statusFilter === 'short_listed' && isCompletedLoading) ||
    (statusFilter === 'rejected' && isRejectedLoading) ||
    (statusFilter === 'hired' && isHiredLoading) ||
    (statusFilter === 'closed' && isClosedLoading) ||
    (isApplicantModeStatus(statusFilter) && isApplicantModeLoading)
  
  // Check if buttons should be enabled based on selected row status
  const isSelectedClosed = selectedRow?.status === 'CLOSED';
  const checkedRows = rows.filter((row: any) => checkedRowIds.includes(row.id));
  const hasCheckedRows = checkedRowIds.length > 0;
  const isViewEnabled = !!selectedRowId;
  const isAddEnabled = !isSelectedClosed && !!selectedRowId && selectedRow?.status === 'NEW_APPLICANT';
  const isUndoEnabled = !isSelectedClosed && !!selectedRowId && (selectedRow?.status === 'SHORTLISTED' || selectedRow?.status === 'REJECTED');
  const isRejectEnabled = hasCheckedRows
    ? checkedRows.length > 0 && checkedRows.every((row: any) => row.status !== 'REJECTED' && row.status !== 'CLOSED')
    : !isSelectedClosed && !!selectedRowId && selectedRow?.status !== 'REJECTED';
  const isDeleteEnabled = hasCheckedRows
    ? checkedRows.length > 0 && checkedRows.every((row: any) => row.status === 'REJECTED')
    : !isSelectedClosed && !!selectedRowId && selectedRow?.status === 'REJECTED';
  const isClosedEnabled = hasCheckedRows
    ? checkedRows.length > 0 && checkedRows.every((row: any) => row.status === 'REJECTED')
    : !isSelectedClosed && !!selectedRowId && selectedRow?.status === 'REJECTED';

  if (isInitialLoading) return <SpinningRingLoader />

  return (
    <div className="p-6 space-y-10 bg-white"> 

      {/* Dialog */}
      <AlertDialogRejected 
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => {
          setDialogOpen(false);
          clearFormat();
        }}
        onSubmit={handleConfirm} 
        isLoading={isDialogLoading}
        showRemarks={dataValue === 'rejected'}
        remarksRequired={dataValue === 'rejected'}
        remarksLabel="Rejection Note"
        remarksPlaceholder="Why is this applicant rejected?"
      /> 

      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='w-full max-w-md'>
          <Breadcrumb 
            items={[
              { label: "Applicants", isActive: true, icon: <QuestionAnswerIcon /> }
            ]}
          />
          
          <p className='mt-5 text-[20px] font-bold'>
            {`${jobDetailed.title}`}
            <p className='text-[16px] text-gray-600'>{`${jobDetailed.job_reference_number}`}</p>
          </p>
        </div>

        <div className='flex flex-col justify-end sm:flex-row items-stretch lg:col-span-2 sm:items-center gap-3 w-full'>
          <div className="w-full sm:w-auto sm:flex-grow sm:max-w-xs">
            <CustomSearchField 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
            />
          </div>

          {/* Action Buttons */}
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 w-full sm:w-auto'>
            {/* View Button - Always available when row is selected */}
            <button
              onClick={handleView}
              disabled={!isViewEnabled}
              title="View"
              aria-label="View"
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto"
              style={{
                background: isViewEnabled ? '#1e40af' : '#9ca3af',
              }}
            >
              <Eye size={18} /> 
              <span className="hidden sm:inline whitespace-nowrap">View</span>
            </button>

            {/* Add/Shortlist Button - Only for NOT_SHORTLISTED */}
            {/* <button
              onClick={handleAdd}
              disabled={!isAddEnabled}
              title="Add to Shortlist"
              aria-label="Add to Shortlist"
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto"
              style={{
                background: isAddEnabled ? '#15803d' : '#9ca3af',
              }}
            >
              <Plus size={18} /> 
              <span className="hidden sm:inline whitespace-nowrap">Add</span>
            </button> */}

            {/* Undo Button - For SHORTLISTED and REJECTED */}
            {/* <button
              onClick={handleUndo}
              disabled={!isUndoEnabled}
              title="Undo"
              aria-label="Undo"
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto"
              style={{
                background: isUndoEnabled ? '#f59e0b' : '#9ca3af',
              }}
            >
              <Undo size={18} /> 
              <span className="hidden sm:inline whitespace-nowrap">Undo</span>
            </button> */}

            {/* Reject Button - For NOT_SHORTLISTED and SHORTLISTED */}
            {/* <button
              onClick={handleReject}
              disabled={!isRejectEnabled}
              title="Reject"
              aria-label="Reject"
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto"
              style={{
                background: isRejectEnabled ? '#dc2626' : '#9ca3af',
              }}
            >
              <X size={18} /> 
              <span className="hidden sm:inline whitespace-nowrap">Reject</span>
            </button> */}

            {/* Delete Button - Only for REJECTED */}
            {/* <button
              onClick={handleDelete}
              disabled={!isDeleteEnabled}
              title="Delete"
              aria-label="Delete"
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto"
              style={{
                background: isDeleteEnabled ? '#7f1d1d' : '#9ca3af',
              }}
            >
              <Trash2 size={18} /> 
              <span className="hidden sm:inline whitespace-nowrap">Delete</span>
            </button> */}

            <button
              onClick={handleBack} 
              title="Back"
              aria-label="Back"
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto"
              style={{
                background: '#FFC81E',
              }}
            >
              <ArrowLeftToLine size={18} /> 
              <span className="hidden sm:inline whitespace-nowrap">Back</span>
            </button>

            {/* Closed Button - Only for REJECTED */}
            <button
              onClick={handleClosed} 
              title="Closed"
              aria-label="Closed"
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto"
              style={{
                background: isClosedEnabled ? '#0f766e' : '#9ca3af',
              }}
            >
              <MailX size={18} /> 
              <span className="hidden sm:inline whitespace-nowrap">Closed</span>
            </button>
          </div>
        </div> 
      </div>

      {/* Table */}
      <TableApplicants 
        columns={columns}
        rows={filteredInquiries}
        selectedRowId={selectedRowId}
        checkedRowIds={checkedRowIds}
        setCheckedRowIds={setCheckedRowIds}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        page={applicantsPage}
        onPageChange={handleApplicantsPageChange}
        isLoading={isTableLoading}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  )
}

export default Applicants
