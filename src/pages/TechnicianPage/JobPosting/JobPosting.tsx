import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import {getAllJobPosting} from '../../../services/Technician/careers'
import { useNavigate } from "react-router-dom"
import { 
  User2, 
  Plus, 
} from "lucide-react"
import TableUsers from "./components/TableJobPosting"
import { useQuery } from "@tanstack/react-query" 
import { userAuth } from "../../../hooks/userAuth"
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician"
import CustomSearchField from "../../../components/Fields/CustomSearchField"
import { useState, useMemo, useEffect } from "react"
import WorkIcon from '@mui/icons-material/Work';
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'

const JobPosting = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const { 
    userInfo, 
    snackBarMessage, 
    snackBarType, 
    snackBarOpen, 
    setSnackBarOpen  
  } = userAuth()

  const columns = [
    { id: 'job_reference_number', label: 'Job Ref', sortable: true, align: 'left' },
    { id: 'title', label: 'Title', sortable: false, align: 'left' }, 
    { id: 'description', label: 'Description', sortable: false, align: 'left' },
    { id: 'job_type', label: 'Job Type', sortable: true, align: 'left' },
    { id: 'work_location', label: 'Work Location', sortable: false, align: 'left' }, 
    { id: 'location', label: 'Location', sortable: false, align: 'left' },
    { id: 'created_at', label: 'Date', sortable: false, align: 'right' }
  ]

  const { data: jobResponse, isLoading } = useQuery({
     queryKey: ['job', userInfo?.id],
    queryFn: () => getAllJobPosting(),   // FIXED
    enabled: !!userInfo?.id  
  });

  const handleDelete = (ids: number[]) => {
    console.log('delete', ids)
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

      <TableUsers 
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
