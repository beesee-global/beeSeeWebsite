import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import {
  getAllJobPosting, 
  deleteCareers
} from '../../../services/Technician/careersServices'
import { useNavigate } from "react-router-dom"
import { 
  User2, 
  Plus,
  Pencil,
  Trash2,
  Eye
} from "lucide-react"
import TableJobPosting from "./components/TableJobPosting"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query" 
import { userAuth } from "../../../hooks/userAuth" 
import CustomSearchField from "../../../components/Fields/CustomSearchField"
import { useState, useMemo, useEffect } from "react"
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'
import AlertDialog from '../../../components/feedback/AlertDialog';

const JobPosting = () => {
  const navigate = useNavigate();
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([])
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  
  const { 
    userInfo,  
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
  } = userAuth()

  const queryClient = useQueryClient();

  const columns = [
    { id: 'job_reference_number', label: 'Job No.', sortable: true, align: 'left' },
    { id: 'title', label: 'Job Position', sortable: false, align: 'left' },   
    { id: 'job_type', label: 'Job Type', sortable: true, align: 'left' },
    { id: 'work_location', label: 'Work Location', sortable: false, align: 'left' }, 
    { id: 'location', label: 'Location', sortable: false, align: 'left' },
    { id: 'num_applicant', label: "No. Applicant", sortable: false, align: 'left' },
    { id: 'status', label: "Status", sortable: false, align: 'left' },
    { id: 'created_at', label: 'Posted Date', sortable: false, align: 'right' }
  ]

  const Permission = userInfo?.permissions?.find(p => p.parent_id === 'careers' && p.children_id === '');
  
  const { data: jobResponse, isLoading } = useQuery({
    queryKey: ['job', userInfo?.id],
    queryFn: () => getAllJobPosting(),
    enabled: !!userInfo?.id  
  });

  const { mutateAsync: deleteCareer } = useMutation({
    mutationFn: deleteCareers
  });

  const handleDelete = async() => { 
    if (!selectedRowId) {
      setSnackBarMessage("Please select a job posting first")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    if (!Permission?.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete careers.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    }
    
    setDeleteIds([selectedRowId])
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete this job posting?`)
  };

  const handleConfirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("ids", JSON.stringify(deleteIds)); 
      formData.append("user_id", String(userInfo?.id));  

      const response = await deleteCareer(formData);

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        setSelectedRowId(null)
        setSnackBarMessage("Job posting deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        // Refetch jobs
        queryClient.invalidateQueries({ queryKey: ['job'] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to delete job posting. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }
  
  const handleUpdate = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select a job posting first")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    const selectedJob = job.find((j: any) => j.id === selectedRowId);
    if (selectedJob) {
      navigate(`/beesee/job-posting/form/${selectedJob.job_reference_number}`)
    }
  }

  const handleView = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select a job posting first")
      setSnackBarType("warning")
      setSnackBarOpen(true)
      return
    }

    const selectedJob = job.find((j: any) => j.id === selectedRowId);
    if (selectedJob) {
      const apiUrl = import.meta.env.VITE_API_URL_FRONTEND;
      const linkToCopy = `${apiUrl}/bsg/career/${selectedJob.job_reference_number}`;
      
      window.open(
        `${linkToCopy}`,
        "_blank",
        "noopener,noreferrer"
      )
    }
  }

  const handleRowClick = (row: any) => {
    setSelectedRowId(row.id);
  }

  const handleRowDoubleClick = (row: any) => {
    navigate(`/beesee/job-posting/applicants/${row.job_reference_number}`)
  }

  const job = jobResponse?.data || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const filteredJob = useMemo(() => {
    if (!debouncedSearch?.trim()) return job 
    return job.filter((u: any) => 
      u.job_reference_number.toLowerCase().includes(debouncedSearch?.toLowerCase()) || 
      u.title.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      u.description.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      u.work_location.toLowerCase().includes(debouncedSearch?.toLowerCase()) || 
      u.location.toLowerCase().includes(debouncedSearch?.toLowerCase())
    )
  }, [job, debouncedSearch]);

  if (isLoading) return <SpinningRingLoader />

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-10 bg-white"> 

      {/* Dialog */}
      <AlertDialog 
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleConfirmDelete} 
      />

      {/* Header Section - Responsive layout */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
        {/* Breadcrumb Section */}
        <div className='flex items-center w-full'>
          <Breadcrumb
            items={[
              { label: 'Careers', isActive: true, icon:<User2 /> }
            ]}
          />
        </div>
        
        {/* Search and Action Buttons Section */}
        <div className='flex flex-col sm:flex-row items-stretch lg:col-span-2 sm:items-center justify-end gap-3 w-full'>
          {/* Search Field - Full width on mobile, auto width on larger screens */}
          <div className="w-full sm:w-auto sm:flex-grow sm:max-w-xs">
            <CustomSearchField 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="w-full"
            />
          </div>
          
          {/* Action Buttons - Full width on mobile, auto width on larger screens */}
          <div className="flex flex-wrap gap-2">
            {/* Add Job Post Button */}
            {Permission?.actions.includes('add') &&
              <button 
                onClick={() => navigate('/beesee/job-posting/form')} 
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm"
              >
                <Plus size={18} /> 
                <span className="whitespace-nowrap">Add Job Post</span>
              </button>
            }

            {/* Update Button - Always show, just disable if no selection */}
            <button 
              onClick={handleUpdate}
              disabled={!selectedRowId}
              className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              style={{
                background: selectedRowId ? '#15803d' : '#9ca3af',
              }}
            >
              <Pencil size={18} /> 
              <span className="whitespace-nowrap">Update</span>
            </button>

            {/* View Button - Always show, just disable if no selection */}
            <button 
              onClick={handleView}
              disabled={!selectedRowId}
              className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              style={{
                background: selectedRowId ? '#1e40af' : '#9ca3af',
              }}
            >
              <Eye size={18} /> 
              <span className="whitespace-nowrap">View</span>
            </button>

            {/* Delete Button */}
            {Permission?.actions.includes('delete') &&
              <button 
                onClick={handleDelete}
                disabled={!selectedRowId}
                className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                style={{
                  background: selectedRowId ? '#dc2626' : '#9ca3af',
                }}
              >
                <Trash2 size={18} /> 
                <span className="whitespace-nowrap">Delete</span>
              </button>
            }
          </div>
        </div>
      </div>

      {/* Table Section */}
      <TableJobPosting
        rows={filteredJob}
        columns={columns}
        selectedRowId={selectedRowId}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        isLoading={isLoading}
      />
    </div>
  )
}

export default JobPosting