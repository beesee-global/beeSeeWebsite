import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import {fetchUsers} from '../../../services/Technician/userServices'
import { useNavigate } from "react-router-dom"
import { 
  User2, 
  Plus, 
} from "lucide-react"
import TableUsers from "./components/TableUsers"
import { useQuery } from "@tanstack/react-query" 
import { userAuth } from "../../../hooks/userAuth"
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician"
import CustomSearchField from "../../../components/Fields/CustomSearchField"
import { useState, useMemo, useEffect } from "react"
import WorkIcon from '@mui/icons-material/Work';
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'

const Users = () => {
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
    { id: 'full_name', label: 'Full name', sortable: true, align: 'left' },
    { id: 'email', label: 'Email', sortable: false, align: 'left' }, 
    { id: 'status', label: 'Status', sortable: false, align: 'left' },
    { id: 'created_at', label: 'Date', sortable: false, align: 'right' }
  ]

  const { data: userResponse, isLoading } = useQuery({
     queryKey: ['users', userInfo?.id],
    queryFn: () => fetchUsers(Number(userInfo?.id)),   // FIXED
    enabled: !!userInfo?.id  
  });

  const handleDelete = (ids: number[]) => {
    console.log('delete', ids)
  }
  
  const handleEdit = (pid: string | number) => { 
    navigate(`/beesee/users/form/${pid}`)
  }

  const users = userResponse?.data || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch?.trim()) return users

    return users.filter((u: any) => 
      u.full_name.toLowerCase().includes(debouncedSearch?.toLowerCase()) || 
      u.email.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      u.status.toLowerCase().includes(debouncedSearch?.toLowerCase())
    )
  }, [users, debouncedSearch]);

  if (isLoading) return <SpinningRingLoader />

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      {/* Snackbar */}
      <SnackbarTechnician 
        open={snackBarOpen} 
        type={snackBarType} 
        message={snackBarMessage} 
        onClose={() => setSnackBarOpen(false)} 
      />

      {/* Top Section - Layout adjusted for mobile */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 mb-6">
        {/* Breadcrumb Section */}
        <div className='flex items-center w-full'>
          <Breadcrumb
            items={[
              { label: "Job Order", href: "/beesee/job-order", icon: <WorkIcon/> }, 
              { label: 'Users', isActive: true, icon:<User2 /> }
            ]}
          />
        </div>
        
        {/* Search and Add Button Section - Stack on mobile, side-by-side on larger screens */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full'>
          {/* Search Field - Full width on mobile, auto width on larger screens */}
          <div className="w-full sm:w-auto sm:flex-grow sm:max-w-xs">
            <CustomSearchField 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search users..."
              className="w-full"
            />
          </div>
          
          {/* Add Button - Full width on mobile, auto width on larger screens */}
          <div className="w-full sm:w-auto">
            <button 
              onClick={() => navigate('/beesee/users/form')} 
              className="flex items-center justify-center gap-2 px-4 py-3 w-full sm:w-auto bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm sm:text-base"
            >
              <Plus size={18} className="sm:size-5" /> 
              <span className="whitespace-nowrap">Add Users</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section - Left exactly as is */}
      <TableUsers 
        rows={filteredUsers}
        columns={columns}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Users