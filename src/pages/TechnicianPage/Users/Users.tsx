import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import {
  fetchUsers,
  deleteUsers
} from '../../../services/Technician/userServices'
import { useNavigate } from "react-router-dom"
import { 
  User2, 
  Plus,
  Pencil,
  Trash2
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
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { 
    userInfo, 
    setSnackBarOpen,
    setSnackBarMessage,
    setSnackBarType
  } = userAuth()

  const columns = [
    { id: 'full_name', label: 'Full name', sortable: true, align: 'left' },
    { id: 'email', label: 'Email', sortable: true, align: 'left' }, 
    { id: 'employment_status', label: 'Status', sortable: false, align: 'left' },
    { id: 'created_at', label: 'Date', sortable: false, align: 'right' }
  ]

  const Permission = userInfo?.permissions?.find(p => p.parent_id === 'users' && p.children_id === 'list_user');

  const { data: userResponse, isLoading } = useQuery({
     queryKey: ['users', userInfo?.id],
    queryFn: () => fetchUsers(Number(userInfo?.id)),
    enabled: !!userInfo?.id  
  });

  const { mutateAsync: deleteUser } = useMutation({
    mutationFn: deleteUsers
  });

  const users = userResponse?.data || [];
  // const selectedUser = users.find((u: any) => u.id === selectedRowId);

  // Handle Row Click (Select)
  const handleRowClick = (row: any) => {
    setSelectedRowId(row.id);
  };

  // Handle Row Double Click (Edit)
  const handleRowDoubleClick = (row: any) => {
    if (!Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit users.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }
    navigate(`/beesee/users/form/${row.pid}`);
  };

  // Handle Update Button Click
  const handleUpdate = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select a user first");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }

    if (!Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit users.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }

    const user = users.find((u: any) => u.id === selectedRowId);
    if (user) {
      navigate(`/beesee/users/form/${user.pid}`);
    }
  };

  // Handle Delete Button Click
  const handleDeleteClick = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select a user first");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }

    if (!Permission?.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete users.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }

    setDeleteIds([selectedRowId]);
    setDialogTitle("Confirm Delete");
    setDialogOpen(true);
    setDialogMessage("Are you sure you want to delete this user?");
  };

  const handleConfirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("ids", JSON.stringify(deleteIds)); 
      formData.append("user_id", String(userInfo?.id)); 

      const response = await deleteUser(formData);

      if (response?.success) {
        setDialogOpen(false);
        setDialogMessage('');
        setDialogTitle("");
        setSelectedRowId(null);
        setSnackBarMessage("User deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        queryClient.invalidateQueries({ queryKey: ['users', userInfo?.id] });
      }
    } catch (error) {
      const rawMessage = error?.response?.data?.message || "Failed to update position. Please try again.";
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");

      setSnackBarMessage(cleanMessage)
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch?.trim()) return users

    return users.filter((u: any) => 
      u.full_name?.toLowerCase().includes(debouncedSearch?.toLowerCase()) || 
      u.email?.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      u.status?.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      u.details?.position?.toLowerCase().includes(debouncedSearch?.toLowerCase())
    )
  }, [users, debouncedSearch]);

  // Check if buttons should be enabled
  const isUpdateEnabled = !!selectedRowId;
  const isDeleteEnabled = !!selectedRowId;

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

      {/* Top Section - Layout adjusted for mobile */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
        {/* Breadcrumb Section */}
        <div className='flex items-center w-full'>
          <Breadcrumb
            items={[  
              { label: 'Users', isActive: true, icon:<User2 /> }
            ]}
          />
        </div>
        
        {/* Search and Action Buttons Section */}
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
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Add User Button */}
            {Permission?.actions.includes('add') && (
              <button 
                onClick={() => navigate('/beesee/users/form')} 
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm"
              >
                <Plus size={18} /> 
                <span className="whitespace-nowrap">Add User</span>
              </button>
            )}

            {/* Update Button */}
            {Permission?.actions.includes('edit') && (
              <button
                onClick={handleUpdate}
                disabled={!isUpdateEnabled}
                className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                style={{
                  background: isUpdateEnabled ? '#15803d' : '#9ca3af',
                }}
              >
                <Pencil size={18} /> 
                <span className="whitespace-nowrap">Update</span>
              </button>
            )}

            {/* Delete Button */}
            {Permission?.actions.includes('delete') && (
              <button
                onClick={handleDeleteClick}
                disabled={!isDeleteEnabled}
                className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                style={{
                  background: isDeleteEnabled ? '#dc2626' : '#9ca3af',
                }}
              >
                <Trash2 size={18} /> 
                <span className="whitespace-nowrap">Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selected User Info */}
      {/* {selectedUser && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Selected: <span className="font-bold">{selectedUser.first_name} {selectedUser.last_name}</span> ({selectedUser.email})
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Single click to select • Double click to edit
          </p>
        </div>
      )} */}

      {/* Table Section */}
      <TableUsers 
        rows={filteredUsers}
        columns={columns}
        selectedRowId={selectedRowId}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Users