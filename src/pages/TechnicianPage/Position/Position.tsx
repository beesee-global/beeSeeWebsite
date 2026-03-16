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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { userAuth } from '../../../hooks/userAuth';
import TableDefault from '../../../components/DataDisplay/TableDefault' 
import Modal from './components/Modal' 
import AlertDialog from '../../../components/feedback/AlertDialog';
import CustomSearchField from '../../../components/Fields/CustomSearchField';
import WorkIcon from '@mui/icons-material/Work';

/* ================= TYPES ================= */
interface Permission {
  parent_id: string;
  children_id: string;
  module_name: string;
  module_url: string;
  actions: string[];
}

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
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null); 
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { 
      userInfo,
      setSnackBarMessage, 
      setSnackBarOpen, 
      setSnackBarType, 
    } = userAuth()

    const Permission = userInfo?.permissions?.find(p => p.parent_id === 'users' && p.children_id === 'position');
  
    const { data: positionResponse, isLoading } = useQuery({
      queryKey: ['positions'],
      queryFn: fetchPositions
    }); 
  
    const positions = positionResponse?.data || [];

    const { mutateAsync: createPosition } = useMutation({
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
      { id: 'description', label: "Description", sortable: true, align: "left" },
      { id: 'created_at', label: '', sortable: false, align: "right" },
    ];

    // Helper function to compare permissions deeply
    const permissionsEqual = (a: Permission[], b: Permission[]) => {
      if (a.length !== b.length) return false;
      
      return a.every((permA) => {
        const permB = b.find((p) => 
          p.module_name === permA.module_name && 
          p.parent_id === permA.parent_id &&
          p.children_id === permA.children_id
        );
        
        if (!permB) return false;
        
        // Compare actions arrays
        if (permA.actions.length !== permB.actions.length) return false;
        return permA.actions.every((action) => permB.actions.includes(action));
      });
    };

    // Handle Delete Button Click
    const handleDeleteClick = () => {
      if (!selectedRowId) {
        setSnackBarMessage("Please select an position first");
        setSnackBarType("warning");
        setSnackBarOpen(true);
        return;
      }

      if (!Permission?.actions.includes('delete')) {
        setSnackBarMessage("You do not have permission to delete position.");
        setSnackBarType("error");
        setSnackBarOpen(true);
        return;
      }

      setDeleteIds([selectedRowId]);
      setDialogTitle("Confirm Delete");
      setDialogOpen(true);
      setDialogMessage("Are you sure you want to delete this position?");
    };
    
    const handleConfirmDelete = async () => {
      try {

        const formData = new FormData();
        formData.append("ids", JSON.stringify(deleteIds)); 
        formData.append("user_id", String(userInfo?.id)); 

        const response = await deletePosition(formData);
  
        if (response?.success) {
          setDialogOpen(false)
          setDialogMessage('')
          setDialogTitle("")
          setSnackBarMessage("Position deleted successfully");
          setSnackBarType("success");
          setSnackBarOpen(true);
  
          queryClient.invalidateQueries({ queryKey: ['positions'] });
        }
      } catch (error:any) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")

        if (error.response?.status === 400) {
          const rawMessage = error?.response?.data?.message || "Failed to update position. Please try again.";
          const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");
          setSnackBarMessage(cleanMessage)
          setSnackBarType('info')
          setSnackBarOpen(true);
          return
        }
        setSnackBarMessage("Failed to delete position. Please try again.");
        setSnackBarType("error");
        setSnackBarOpen(true);
      }
    }

    // Handle Update Button Click
    const handleUpdate = () => {
      if (!selectedRowId) {
        setSnackBarMessage("Please select an position first");
        setSnackBarType("warning");
        setSnackBarOpen(true);
        return;
      }

      if (!Permission?.actions.includes('edit')) {
        setSnackBarMessage("You do not have permission to edit position.");
        setSnackBarType("error");
        setSnackBarOpen(true);
        return;
      }

      const position = positions.find((f: any) => f.id === selectedRowId);
      if (!position) return;
      
      setSelectedPosition(position);
      setIsEditMode(true);
      setModalOpen(true);
    };
    
    // Handle Row Click (Select)
    const handleRowClick = (row: any) => {
      setSelectedRowId(row.id);
    };

    // Handle Row Double Click (Edit)
    const handleRowDoubleClick = (row: any) => {
      if (!Permission?.actions.includes('edit')) {
        setSnackBarMessage("You do not have permission to edit position.");
        setSnackBarType("error");
        setSnackBarOpen(true);
        return;
      }
      
      const position = positions.find((f: any) => f.id === row.id);
      if (!position) return;
      
      setSelectedPosition(position);
      setIsEditMode(true);
      setModalOpen(true);
    };
    
    const handleAddPosition = async (formDataPosition: Record<string, any>) => {
      try {
        // Create the exact payload format
        const payload = {
          name: formDataPosition.name,
          description: formDataPosition.description || "",
          is_protected: 0, // New positions are not protected by default
          permissions: formDataPosition.permissions,
          user_id: userInfo?.id // Include user_id in the payload
        };
 

        const response = await createPosition(payload)
  
        if (response?.success) {
          setSnackBarMessage("Position created successfully")
          setSnackBarType('success')
          setSnackBarOpen(true)
          setModalOpen(false);
  
          queryClient.invalidateQueries({ queryKey: ['positions'] });
        }
      } catch (error: any) {
        console.error("Create Position Error:", error);
        setSnackBarMessage(error?.response?.data?.message || "Failed to create position. Please try again.")
        setSnackBarType('error')
        setSnackBarOpen(true)
      }
    };
  
    const handleUpdatePosition = async (formDataPosition: Record<string, any>) => {
      try {
        // Check if position is protected
        if (selectedPosition.is_protected === 1 || selectedPosition.is_protected === true) {
          // Compare permissions to ensure they haven't changed
          if (!permissionsEqual(selectedPosition.permissions || [], formDataPosition.permissions)) {
            setSnackBarMessage("The permissions cannot be modified for this protected role")
            setSnackBarType("warning")
            setSnackBarOpen(true)
            return
          }
        }
        
        // Create the exact payload format
        const payload = {
          name: formDataPosition.name,
          description: formDataPosition.description || "",
          is_protected: selectedPosition.is_protected || 0,
          permissions: formDataPosition.permissions,
          user_id: userInfo?.id // Include user_id in the payload
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
      } catch (error: any) {
        console.error("Update Position Error:", error);
        setSnackBarMessage(error?.response?.data?.message || "Failed to update position. Please try again.");
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
    }, [positions, debouncedSearch]);

    const isUpdateEnabled = !!selectedRowId;
    const isDeleteEnabled = !!selectedRowId

  return (
    <div className='p-4 sm:p-6 space-y-6 sm:space-y-10 bg-white'> 

      {/* Dialog */}
      <AlertDialog 
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleConfirmDelete} 
      />

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setIsEditMode(false);
          setSelectedPosition(null);
          setIsPermissionLocked(false);
        }}
        title={isEditMode ? "Edit Position" : "Add New Position"}
        description={
          isEditMode 
            ? "Update position details and access permissions" 
            : "Create a new position with specific access permissions"
        }
        fields={[
          {
            name: 'name',
            placeholder: 'Position Name',
            type: 'text',
            value: isEditMode ? selectedPosition?.name || "" : "",
            validator: (value) => !value.trim() ? 'Position name is required' : undefined
          },
          {
            name: 'description',
            placeholder: 'Description',
            type: 'text',
            value: isEditMode ? selectedPosition?.description || "" : "",
            validator: (value) => !value.trim() ? 'Description is required' : undefined
          },
        ]}
        isPermissionLocked={isPermissionLocked}
        initialPermissions={isEditMode ? selectedPosition?.permissions || [] : []}
        onSubmit={isEditMode ? handleUpdatePosition : handleAddPosition}
        submitLabel={isEditMode ? "Update Position" : "Create Position"}
      />

      {/* Header Section - Responsive layout */}
      <div className='flex flex-col lg:grid lg:grid-cols-2 gap-4'>
        {/* Breadcrumb Section */}
        <div className="flex items-center w-full"> 
          <Breadcrumb 
            items={[ 
              { label: "Position", isActive: true, icon: <ManageAccountsIcon /> },
            ]}
          />
        </div>
        
        {/* Search and Add Button Section */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full'>
          {/* Search Field */}
          <div className="w-full sm:w-auto sm:flex-grow sm:max-w-xs">
            <CustomSearchField 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder='Search positions...'
              className="w-full"
            />
          </div>
          
          {/* Add Button */}
          {Permission?.actions.includes('add') &&
            <div className="w-full sm:w-auto">
              <button 
                onClick={() => {
                  setModalOpen(true)
                  setIsEditMode(false)
                  setSelectedPosition(null)
                  setIsPermissionLocked(false)
                }} 
                className='flex items-center justify-center gap-2 px-4 py-3 w-full sm:w-auto bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm sm:text-base'
              >
                <Plus size={18} className="sm:size-5" /> 
                <span className="whitespace-nowrap">Add Position</span>
              </button>
            </div>
          }

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

      {/* Table Section */}
      <TableDefault 
        rows={filteredPosition}
        columns={customColumns}
        isLoading={isLoading}
        selectedRowId={selectedRowId}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
      />
    </div>
  )
}

export default Position