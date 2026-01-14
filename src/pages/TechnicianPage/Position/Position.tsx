import { useState, useMemo, useEffect } from 'react';
import Breadcrumb from '../../../components/Navigation/Breadcrumbs'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { 
  useQuery, 
  useMutation, 
  useQueryClient  
} from '@tanstack/react-query';
import {   
  createPositions,
  deletePositions,
  fetchPositions,
  updatePositions
} from '../../../services/Technician/positionsServices'
import { Plus } from 'lucide-react'
import { userAuth } from '../../../hooks/userAuth';
import TableDefault from '../../../components/DataDisplay/TableDefault' 
import Modal from './components/Modal'
import SnackbarTechnician from '../../../components/feedback/SnackbarTechnician';
import AlertDialog from '../../../components/feedback/AlertDialog';
import CustomSearchField from '../../../components/Fields/CustomSearchField';
import WorkIcon from '@mui/icons-material/Work';

const Position = () => {
    const [searchValue, setSearchValue] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("")
    const [dialogOpen , setDialogOpen] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>("");
    const [dialogTitle, setDialogTitle] = useState<string>("");
    const [deleteIds, setDeleteIds] = useState<number[]>([])
  
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<any>(null); 
    const [isPermissionLocked , setIsPermissionLocked ] = useState<boolean>(false)
   
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { 
      setSnackBarMessage, 
      setSnackBarOpen, 
      setSnackBarType,
      snackBarMessage ,
      snackBarOpen,
      snackBarType
    } = userAuth()

    const { data: positionResponse, isLoading } = useQuery({
      queryKey: ['positions'],
      queryFn: fetchPositions
    }); 
  
    // Extract data array from response
    // Adjust based on your API response structure
    const positions = positionResponse?.data || []; // If API returns { data: [...] } 

     const { mutateAsync: Position } = useMutation({
        mutationFn: createPositions
      });
    
      const { mutateAsync: deletePosition} = useMutation({
        mutationFn: deletePositions
      });
    
      const { mutateAsync: updatePosition } = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: any }) =>
          updatePositions(id, payload),
      });
    
      const queryClient = useQueryClient();
    
      // Custom columns
      const customColumns = [
        { id: 'name', label: 'Name', sortable: true, align: "left" }, 
        { id: 'permission', label: "Permission", align: "left" },
        { id: 'created_at', label: '', sortable: false, align: "right" },
      ];

      const arrayEqual = (a: string[], b: string[]) => {
        if (a.length !== b.length) return false;
        return a.every((value) => b.includes(value))
      }
    
      const handleDelete = async(ids: number[]) => { 
        setDeleteIds(ids)
        setDialogTitle("Confirm Delete")
        setDialogOpen(true)
        setDialogMessage(`Are you sure you want to delete ${ids.length} positions?`)
      };
    
      const handleConfirmDelete = async () => {
        try {
          const response = await deletePosition(deleteIds); // call mutation
    
          if (response?.success) {
            setDialogOpen(false)
            setDialogMessage('')
            setDialogTitle("")
            setSnackBarMessage("Position deleted successfully");
            setSnackBarType("success");
            setSnackBarOpen(true);
    
            // Refetch categories
            queryClient.invalidateQueries({ queryKey: ['positions'] });
          }
        } catch (error:any) {
          setDialogOpen(false)
          setDialogMessage('')
          setDialogTitle("")

          if (error.response?.status === 400) {
            setSnackBarMessage(error.response?.data?.message)
            setSnackBarType('info')
            setSnackBarOpen(true);
            return
          }
          setSnackBarMessage("Failed to delete position. Please try again.");
          setSnackBarType("error");
          setSnackBarOpen(true);
        }
      }
    
      const handleEdit = (pid : string | number) => {
        const position = positions.find((c: any) => c.pid === pid || c.id === pid);
        if (!position) return;  
        if (position.id === 3) {
          setIsPermissionLocked(true)
         } else {
          setIsPermissionLocked(false)
         }
        setSelectedPosition(position);
        setIsEditMode(true);
        setModalOpen(true);
      }
     
      const handleAddPosition = async (formDataPosition: Record<string, string>) => {
        try {
          const formData = new FormData();
          formData.append('name', formDataPosition.name);
          formData.append("permission", JSON.stringify(formDataPosition.permissions))
          const response = await Position(formData)
    
          if (response?.success) {
            setSnackBarMessage("Position created successfully")
            setSnackBarType('success')
            setSnackBarOpen(true)
    
            // Refetch categories
            queryClient.invalidateQueries({ queryKey: ['positions'] });
          }
        } catch (error) {
          setSnackBarMessage("Failed to submit, Please try again.")
          setSnackBarType('error')
          setSnackBarOpen(true)
        }
      };
    
      const handleUpdatePosition = async (formDataPosition: Record<string, string>) => {
        try {

          if (selectedPosition.id === 3) {
            if (!arrayEqual(selectedPosition.permission, formDataPosition.permissions)) {
              setSnackBarMessage("The permission cannot modified")
              setSnackBarType("warning")
              setSnackBarOpen(true)
              return
            }
          }
          
          const payload = {
            name: formDataPosition.name,
            permission: JSON.stringify(formDataPosition.permissions)
          };
    
          const response = await updatePosition({
            id: selectedPosition.id,
            payload
          });
    
          if (response?.success) {
            setSnackBarMessage("Position updated successfully");
            setSnackBarType("success");
            setSnackBarOpen(true);
    
            queryClient.invalidateQueries({ queryKey: ["positions"] });
            setModalOpen(false);
          }
        } catch (error) {
          setSnackBarMessage("Failed to update position");
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

      const filteredPosition = useMemo(() => {
        if (!debouncedSearch.trim()) return positions
        return positions.filter((c: any) => 
          c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      }, [positions, debouncedSearch])

  return (
    <div className='p-4 sm:p-6 space-y-6 sm:space-y-10 bg-white min-h-screen'>
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditMode ? "Edit Position" : "Add New Position"}
        fields={[
          {
            name: 'name',
            placeholder: 'Position Name',
            maxLength: 100,
            type: 'text',
            multiline: false,
            rows: 1,
            value: isEditMode ? selectedPosition?.name || "" : "",
            validator: (value) => !value.trim() ? 'Name is required' : undefined
          }
        ]}
        isPermissionLocked={isPermissionLocked}
        initialPermissions={isEditMode ? selectedPosition?.permission || [] : []}
        onSubmit={isEditMode ? handleUpdatePosition : handleAddPosition}
      />

      {/* Header Section - Responsive layout */}
      <div className='flex flex-col lg:grid lg:grid-cols-2 gap-4'>
        {/* Breadcrumb Section */}
        <div className="flex items-center w-full"> 
          <Breadcrumb 
            items={[
              { label: "Job Order", href: "/beesee/job-order", icon: <WorkIcon /> }, 
              { label: "Position", isActive: true, icon: <ManageAccountsIcon /> },
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
              placeholder='Search positions...'
              className="w-full"
            />
          </div>
          
          {/* Add Button - Full width on mobile, auto width on larger screens */}
          <div className="w-full sm:w-auto">
            <button 
              onClick={() => {
                setModalOpen(true)
                setIsEditMode(false)
                setIsPermissionLocked(false)
              }} 
              className='flex items-center justify-center gap-2 px-4 py-3 w-full sm:w-auto bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm sm:text-base'
            >
              <Plus size={18} className="sm:size-5" /> 
              <span className="whitespace-nowrap">Add Position</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <TableDefault 
        rows={filteredPosition}
        columns={customColumns}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Position