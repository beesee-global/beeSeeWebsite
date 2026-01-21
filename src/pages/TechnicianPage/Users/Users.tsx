import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import {
  fetchUsers,
  deleteUsers
} from '../../../services/Technician/userServices'
import { useNavigate } from "react-router-dom"
import { 
  User2, 
  Plus, 
} from "lucide-react"
import TableUsers from "./components/TableUsers"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query" 
import { userAuth } from "../../../hooks/userAuth"
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician"
import CustomSearchField from "../../../components/Fields/CustomSearchField"
import { useState, useMemo, useEffect } from "react" 
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'
import AlertDialog from "../../../components/feedback/AlertDialog"

const Users = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([])
  const queryClient = useQueryClient();

  const { 
    userInfo, 
    snackBarMessage, 
    snackBarType, 
    snackBarOpen, 
    setSnackBarOpen,
    setSnackBarMessage,
    setSnackBarType
  } = userAuth()

  const columns = [
    { id: 'full_name', label: 'Full name', sortable: true, align: 'left' },
    { id: 'email', label: 'Email', sortable: false, align: 'left' }, 
    { id: 'employment_status', label: 'Status', sortable: false, align: 'left' },
    { id: 'created_at', label: 'Date', sortable: false, align: 'right' }
  ]

  const Permission = userInfo?.permissions?.find(p => p.parent_id === 'users' && p.children_id === '');

  const { data: userResponse, isLoading } = useQuery({
     queryKey: ['users', userInfo?.id],
    queryFn: () => fetchUsers(Number(userInfo?.id)),   // FIXED
    enabled: !!userInfo?.id  
  });

  const { mutateAsync: deleteUser } = useMutation({
    mutationFn: deleteUsers
  });

  const handleDelete = (ids: number[]) => {
    if (!Permission?.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete users.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    }
    setDeleteIds(ids)
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete users`)
  }

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteUser(deleteIds); // call mutation

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        setSnackBarMessage("Device type deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        // Refetch categories
        queryClient.invalidateQueries({ queryKey: ['users', userInfo?.id] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to delete category. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }
  
  const handleEdit = (pid: string | number) => { 
    if (!Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit users.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    }
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

      {/* Dialog */}
      <AlertDialog 
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleConfirmDelete} 
      />

      {/* Top Section - Layout adjusted for mobile */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 mb-6">
        {/* Breadcrumb Section */}
        <div className='flex items-center w-full'>
          <Breadcrumb
            items={[  
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
          {Permission?.actions.includes('add') && 
            <div className="w-full sm:w-auto">
              <button 
                onClick={() => navigate('/beesee/users/form')} 
                className="flex items-center justify-center gap-2 px-4 py-3 w-full sm:w-auto bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm sm:text-base"
              >
                <Plus size={18} className="sm:size-5" /> 
                <span className="whitespace-nowrap">Add Users</span>
              </button>
            </div>
          }
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