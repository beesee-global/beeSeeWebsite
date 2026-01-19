import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import {getAllJobPosting, deleteCareers} from '../../../services/Technician/careersServices'
import { useNavigate } from "react-router-dom"
import { 
  User2, 
  Plus, 
} from "lucide-react"
import TableJobPosting from "./components/TableJobPosting"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query" 
import { userAuth } from "../../../hooks/userAuth"
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician"
import CustomSearchField from "../../../components/Fields/CustomSearchField"
import { useState, useMemo, useEffect } from "react"
import WorkIcon from '@mui/icons-material/Work';
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
  const { 
    userInfo, 
    snackBarMessage, 
    snackBarType, 
    snackBarOpen, 
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
  } = userAuth()

  const queryClient = useQueryClient();

  const columns = [
    { id: 'job_reference_number', label: 'Job No.', sortable: true, align: 'left' },
    { id: 'title', label: 'Job Position', sortable: false, align: 'left' }, 
    { id: 'description', label: 'Description', sortable: false, align: 'left' },
    { id: 'job_type', label: 'Job Type', sortable: true, align: 'left' },
    { id: 'work_location', label: 'Work Location', sortable: false, align: 'left' }, 
    { id: 'location', label: 'Location', sortable: false, align: 'left' },
    { id: 'created_at', label: 'Posted Date', sortable: false, align: 'right' },
    { id: 'action', label: "Action", sortable: false, align: 'right'}
  ]

  const Permission = userInfo?.permissions?.find(p => p.parent_id === 'careers' && p.children_id === '');
  
  const { data: jobResponse, isLoading } = useQuery({
     queryKey: ['job', userInfo?.id],
    queryFn: () => getAllJobPosting(),   // FIXED
    enabled: !!userInfo?.id  
  });

  const { mutateAsync: deleteCareer } = useMutation({
    mutationFn: deleteCareers
  });

  const handleDelete = async(ids: number[]) => { 
    if (Permission?.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete careers.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    }
    setDeleteIds(ids)
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete ${ids.length} careers?`)
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteCareer(deleteIds); // call mutation

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        setSnackBarMessage("Job posting deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        // Refetch categories
        queryClient.invalidateQueries({ queryKey: ['job'] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to delete job posting . Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }
  
  const handleEdit = (job_reference_number: string | number) => { 
    console.log(Permission?.actions)
    if (!Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit careers.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    }
    navigate(`/beesee/job-posting/form/${job_reference_number}`)
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
      u.work_location.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      u.location.toLowerCase().includes(debouncedSearch?.toLowerCase())
    )
  }, [job, debouncedSearch]);

  if (isLoading) return <SpinningRingLoader />

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-10 bg-white min-h-screen">
      {/* Snackbar */}
      <SnackbarTechnician 
        open={snackBarOpen} 
        type={snackBarType} 
        message={snackBarMessage} 
        onClose={() => setSnackBarOpen(false)} 
      />

      {/* Dialog */}
      <AlertDialog 
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleConfirmDelete} 
      />

      {/* Header Section - Responsive layout */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
        {/* Breadcrumb Section */}
        <div className='flex items-center w-full'>
          <Breadcrumb
            items={[
              { label: 'Careers', isActive: true, icon:<User2 /> }
            ]}
          />
        </div>
        
        {/* Search and Add Button Section - Search first, then Add button */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full'>
          {/* Search Field - Full width on mobile, auto width on larger screens */}
          <div className="w-full sm:w-auto sm:flex-grow sm:max-w-xs">
            <CustomSearchField 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search job postings..."
              className="w-full"
            />
          </div>
          
          {/* Add Button - Full width on mobile, auto width on larger screens */}
          {Permission?.actions.includes('add') &&
            <div className="w-full sm:w-auto">
              <button 
                onClick={() => navigate('/beesee/job-posting/form')} 
                className="flex items-center justify-center gap-2 px-4 py-3 w-full sm:w-auto bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm sm:text-base"
              >
                <Plus size={18} className="sm:size-5" /> 
                <span className="whitespace-nowrap">Add Job Post</span>
              </button>
            </div>
          }
        </div>
      </div>

      {/* Table Section */}
      <TableJobPosting 
        rows={filteredJob}
        columns={columns}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        isLoading={isLoading}
      />
    </div>
  )
}

export default JobPosting