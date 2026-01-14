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
    { id: 'title', label: 'Title', sortable: false, align: 'left' }, 
    { id: 'description', label: 'Description', sortable: false, align: 'left' },
    { id: 'job_type', label: 'Job Type', sortable: true, align: 'left' },
    { id: 'work_location', label: 'Work Location', sortable: false, align: 'left' }, 
    { id: 'location', label: 'Location', sortable: false, align: 'left' },
    { id: 'created_at', label: 'Posted Date', sortable: false, align: 'right' }
  ]

  const { data: jobResponse, isLoading } = useQuery({
     queryKey: ['job', userInfo?.id],
    queryFn: () => getAllJobPosting(),   // FIXED
    enabled: !!userInfo?.id  
  });

  const { mutateAsync: deleteCareer } = useMutation({
    mutationFn: deleteCareers
  });

  const handleDelete = async(ids: number[]) => { 
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
    <div className="p-6 space-y-10 bg-white">
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

      <div className="grid md:grid-cols-2">
        <div className='flex items-center'>
          <Breadcrumb
            items={[
              { label: "Job Order", href: "/beesee/job-order", icon: <WorkIcon/> }, 
              { label: 'Job Posting', isActive: true, icon:<User2 /> }
            ]}
          />
        </div>
        <div className='md:flex items-center justify-end md:space-x-4 space-y-2 mt-2 md:mt-0 md:space-y-0'>
          <div>
            <CustomSearchField 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
            />
          </div>

          <div>
            <button 
              onClick={() => navigate('/beesee/job-posting/form')} 
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
              <Plus /> Add Job Post
            </button>
          </div>
        </div>
      </div>

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
