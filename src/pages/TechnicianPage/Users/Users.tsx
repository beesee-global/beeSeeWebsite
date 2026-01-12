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
              { label: 'Users', isActive: true, icon:<User2 /> }
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
              onClick={() => navigate('/beesee/users/form')} 
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
              <Plus /> Add Users
            </button>
          </div>
        </div>
      </div>

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
