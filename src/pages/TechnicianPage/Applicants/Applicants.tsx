import React, { useState, useEffect, useMemo } from 'react'
import {    
  fetchApplicants,
  fetchApplicantsShortList,
  fetchApplicantsRejected,
  fetchApplicantsClosed,
  shortList,
  deleteApplicants,
  rejectedApplicants,
  undoRejectedApplicants,
  closedApplicants,
  jobDetails
} from '../../../services/Technician/applicantServices'
import { downloadFile } from '../../../utils/downloadFile';
import {   
  X,
  Undo,
  Trash2, 
  Plus, 
  Eye,
  MailX
} from 'lucide-react'; 

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query' 
import Breadcrumb from '../../../components/Navigation/Breadcrumbs'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import TableApplicants from './components/TableApplicants'; 
import CustomSearchField from "../../../components/Fields/CustomSearchField";
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens' 
import { userAuth } from "../../../hooks/userAuth"
import AlertDialog from '../../../components/feedback/AlertDialog'; 
import { useParams, useNavigate } from 'react-router-dom';

const Applicants = () => { 
  const queryClient = useQueryClient(); 
  const navigate = useNavigate();

  const columns = [ 
    { id: 'full_name', label: 'Name', sortable: true },
    { id: 'phone', label: 'Phone', sortable: true },
    { id: "email", label: 'Email', sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: 'created_at', label: "Date Applied", sortable: false}
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
  const [shortListedId, setShortListedId] = useState('');
  const [deleteIds, setDeleteIds] = useState<number[]>([])
  const [rejectedId, setRejectedId] = useState('') 
  const [undoId, setUndoId] = useState('')
  const [dataValue, setDataValue] = useState<string>('')
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
    data: closedApplicantsResponse,
    isLoading: isClosedLoading,
  } = useQuery ({
    queryKey: ['closed', id],
    queryFn: () => fetchApplicantsClosed(String(id)),
    enabled: !!id,
  });

  const { mutateAsync: shortListed } = useMutation({
    mutationFn: shortList
  });

  const { mutateAsync: deleteApplicante } = useMutation({
     mutationFn: deleteApplicants
  });

  const { mutateAsync: rejectApplicants } = useMutation({
    mutationFn: rejectedApplicants
  })

  const { mutateAsync: undoApplicant } = useMutation({
    mutationFn: undoRejectedApplicants
  });

  const { mutateAsync: closedApplicant } = useMutation({
    mutationFn: closedApplicants
  });

  const jobDetailed = jobDetailsResponse?.data || []
  
  const rows = useMemo(() => {
    let baseRows = [];

    if (statusFilter === "all") baseRows = applicantPendingResponse?.data || [];
    if (statusFilter === "short_listed") baseRows = applicantShortListedResponse?.data || [];
    if (statusFilter === 'rejected') baseRows = applicantsRejectedResponse?.data || [];
    if (statusFilter === 'closed') baseRows = closedApplicantsResponse?.data || [];

    // Remove duplicates based on unique identifier (e.g., id or pid)
    const uniqueRows = Array.from(
      new Map(baseRows.map(item => [item.id, item])).values()
    );

    return uniqueRows;
  }, [statusFilter, applicantPendingResponse, applicantShortListedResponse, applicantsRejectedResponse, closedApplicantsResponse])

  const selectedRow = rows.find((r: any) => r.id === selectedRowId);

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
    if (!selectedRowId) {
      setSnackBarMessage("Please select an applicant first")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    if (selectedRow?.status !== 'NEW_APPLICANT') {
      setSnackBarMessage("This action is only available for new applicants")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    setShortListedId(String(selectedRowId))
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
    if (!selectedRowId) {
      setSnackBarMessage("Please select an applicant first")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    if (selectedRow?.status === 'REJECTED') {
      setSnackBarMessage("This applicant is already rejected")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    setRejectedId(String(selectedRowId));
    setDataValue('rejected')
    setDialogTitle("Confirm Rejected");
    setDialogOpen(true);
    setDialogMessage("Are you sure you want to reject this applicant?");
  }

  const handleClosed = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select an applicant first")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }
    if (selectedRow?.status !== 'REJECTED') {
      setSnackBarMessage("This action is only available for rejected applicants")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }
    setRejectedId(String(selectedRowId));
    setDataValue('closed')
    setDialogTitle("Confirm Closed");
    setDialogOpen(true);
    setDialogMessage("Are you sure you want to mark this applicant as closed? This will send a notification email to the applicant.");
  }

  // Handle Delete (Trash)
  const handleDelete = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select an applicant first")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    if (selectedRow?.status !== 'REJECTED') {
      setSnackBarMessage("This action is only available for rejected applicants")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    setDeleteIds([selectedRowId])
    setDataValue('delete')
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete this applicant?`)
  }

  const handleRowClick = (row: any) => {
    setSelectedRowId(row.id);
  }

  const handleRowDoubleClick = (row: any) => {  
    if (row.status === 'REJECTED') {
      setSnackBarMessage("Cannot view details of rejected applicants. Please shortlist this applicant first or delete permanently.");
      setSnackBarType("info");
      setSnackBarOpen(true);
      return;
    } 
    navigate(`/beesee/job-posting/applicant/email/${row.pid}`)  
  }

  const clearFormat = () => {
    setDataValue("")
    setDeleteIds([])
    setRejectedId("")
    setUndoId("")
    setShortListedId("")
  }

  const handleConfirm = async () => {
    try {
      let response;
      if (dataValue === 'delete') {
        response = await deleteApplicante({ ids: deleteIds, user_id: userInfo?.id });
      } else if (dataValue === 'short-listed') {
        response = await shortListed({ id: shortListedId, user_id: userInfo?.id });
      } else if (dataValue === 'undo') {
        response = await undoApplicant({ id: undoId, user_id: userInfo?.id });
      } else if (dataValue === 'rejected') {
        response = await rejectApplicants({ id: rejectedId, user_id: userInfo?.id });
      } else if (dataValue === 'closed') {
        // For closed, we will also use the rejectApplicants mutation but with a different status
        response = await closedApplicant({ id: rejectedId, user_id: userInfo?.id });
      }

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        setSelectedRowId(null)

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
        queryClient.invalidateQueries({ queryKey: ["short-listed"]})
        queryClient.invalidateQueries({ queryKey: ['rejected']})
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
 
  const isLoading = isPendingLoading || isCompletedLoading
  
  // Check if buttons should be enabled based on selected row status
  const isSelectedClosed = selectedRow?.status === 'CLOSED';
  const isViewEnabled = !!selectedRowId;
  const isAddEnabled = !isSelectedClosed && !!selectedRowId && selectedRow?.status === 'NEW_APPLICANT';
  const isUndoEnabled = !isSelectedClosed && !!selectedRowId && (selectedRow?.status === 'SHORTLISTED' || selectedRow?.status === 'REJECTED');
  const isRejectEnabled = !isSelectedClosed && !!selectedRowId && selectedRow?.status !== 'REJECTED';
  const isDeleteEnabled = !isSelectedClosed && !!selectedRowId && selectedRow?.status === 'REJECTED';
  const isClosedEnabled = !isSelectedClosed && !!selectedRowId && selectedRow?.status === 'REJECTED';

  if (isLoading) return <SpinningRingLoader />

  return (
    <div className="p-6 space-y-10 bg-white"> 

      {/* Dialog */}
      <AlertDialog 
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleConfirm} 
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

        <div className='flex flex-col sm:flex-row items-stretch lg:col-span-2 sm:items-center justify-end gap-3 w-full'>
          <div className="w-full sm:w-auto sm:flex-grow sm:max-w-xs">
            <CustomSearchField 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
            />
          </div>

          {/* Action Buttons */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto'>
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
            <button
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
            </button>

            {/* Undo Button - For SHORTLISTED and REJECTED */}
            <button
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
            </button>

            {/* Reject Button - For NOT_SHORTLISTED and SHORTLISTED */}
            <button
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
            </button>

            {/* Delete Button - Only for REJECTED */}
            <button
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
            </button>

            {/* Closed Button - Only for REJECTED */}
            <button
              onClick={handleClosed}
              disabled={!isClosedEnabled}
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

      {/* Selected Applicant Info */}
      {/* {selectedRow && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Selected: <span className="font-bold">{selectedRow.full_name}</span> - Status: <span className="font-bold">{selectedRow.status}</span>
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Click a row to select • Available actions depend on applicant status
          </p>
        </div>
      )} */}

      {/* Table */}
      <TableApplicants 
        columns={columns}
        rows={filteredInquiries}
        selectedRowId={selectedRowId}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        isLoading={isLoading}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  )
}

export default Applicants
