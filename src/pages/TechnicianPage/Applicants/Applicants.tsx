import React, { useState, useEffect, useMemo } from 'react'
import {    
  fetchApplicants,
  fetchApplicantsShortList,
  shortList,
  deleteApplicants
} from '../../../services/Technician/applicantServices'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query' 
import Breadcrumb from '../../../components/Navigation/Breadcrumbs'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import TableApplicants from './components/TableApplicants'; 
import WorkIcon from '@mui/icons-material/Work';
import CustomSearchField from "../../../components/Fields/CustomSearchField";
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens' 
import { userAuth } from "../../../hooks/userAuth"
import AlertDialog from '../../../components/feedback/AlertDialog';
import SnackbarTechnician from '../../../components/feedback/SnackbarTechnician';
import { useParams } from 'react-router-dom';

const Applicants = () => { 
  const queryClient = useQueryClient(); 

  const columns = [
    { id: 'job_number', label: 'Job No.', sortable: true },
    { id: 'full_name', label: 'Name', sortable: true },
    { id: 'phone', label: 'Phone', sortable: true },
    { id: "email", label: 'Email', sortable: true },
    { id: "position", label: "Position", sortable: true }, 
    { id: "actions", label: "Actions", sortable: true }, 
  ] 

  const {  
      snackBarMessage, 
      snackBarType, 
      snackBarOpen, 
      setSnackBarMessage, 
      setSnackBarOpen, 
      setSnackBarType,
    } = userAuth()
   
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [shortListedId, setShortListedId] = useState('');
  const [deleteIds, setDeleteIds] = useState<number[]>([])
  const [deleteApplicant, setDeleteApplicant] = useState<boolean>(false)
  
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
    enabled: !!id, // optional but recommended
  });
      
  const { 
    data: applicantShortListedResponse, 
    isLoading: isCompletedLoading, 
    error: completedError 
  } = useQuery({
    queryKey: ["short-listed",id],
    queryFn: () => fetchApplicantsShortList(String(id)),
    enabled: !!id,
  });

   const { mutateAsync: shortListed } = useMutation({
     mutationFn: shortList
   });

  const { mutateAsync: deleteApplicante } = useMutation({
     mutationFn: deleteApplicants
   });

  const rows = useMemo(() => {
    let baseRows = [];

    if (statusFilter === "all") baseRows = applicantPendingResponse?.data || [];
    if (statusFilter === "short_listed") baseRows = applicantShortListedResponse?.data || [];

    // Remove duplicates based on unique identifier (e.g., id or pid)
    const uniqueRows = Array.from(
      new Map(baseRows.map(item => [item.id, item])).values()
    );

    return uniqueRows;
  }, [statusFilter, applicantPendingResponse, applicantShortListedResponse])

  const handleEdit = async(ids: string) => { 
    setDeleteApplicant(false)
    setShortListedId(ids)
    setDialogTitle("Confirm Short Listed")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to short list applicants?`)
  };

  const handleConfirm = async () => {
    try {
      let response;
      if (deleteApplicant) {
        response = await deleteApplicante(deleteIds); // call mutation
      } else {
        response = await shortListed(shortListedId); // call mutation
      }

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        if (deleteApplicant) {
          setSnackBarMessage("Applicant deleted successfully");
        } else {
          setSnackBarMessage("Applicant short listed successfully");
        }
        setSnackBarType("success");
        setSnackBarOpen(true);

        // Refetch categories
        queryClient.invalidateQueries({ queryKey: ['all-applicant'] });
        queryClient.invalidateQueries({ queryKey: ["short-listed"]})
      }
    } catch (error) {
      if (deleteApplicant) {  
        setSnackBarMessage("Failed to delete. Please try again.");
      } else { 
        setSnackBarMessage("Failed to short list. Please try again.");
      }
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }

  const handleDelete = async (ids: string) => {
    setDeleteIds(ids)
    setDeleteApplicant(true)
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete applicants?`)
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
      i.job_number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.full_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.phone.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.position.toLowerCase().includes(debouncedSearch.toLowerCase()) 
    )
  }, [rows, debouncedSearch])
 
  const isLoading = isPendingLoading || isCompletedLoading
  
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

      {/* Snackbar */}
      <SnackbarTechnician 
        open={snackBarOpen} 
        type={snackBarType} 
        message={snackBarMessage} 
        onClose={() => setSnackBarOpen(false)} 
      />
      

      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <Breadcrumb 
            items={[
              { label: "Job Order", href: "/beesee/job-order", icon: <WorkIcon /> }, 
              { label: "Applicants", isActive: true, icon: <QuestionAnswerIcon /> }
            ]}
          />
        </div>

        <div>
          <CustomSearchField 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
          />
        </div> 
      </div>

      {/* Table */}
      <TableApplicants 
        columns={columns}
        rows={filteredInquiries}
        handleEdit={handleEdit} 
        handleDelete={handleDelete}
        isLoading={isLoading}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  )
}

export default Applicants
   
        