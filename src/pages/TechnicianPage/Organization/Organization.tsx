import React from 'react'
import { 
  useState, 
  useMemo, 
  useEffect } from 'react'
import Breadcrumb from '../../../components/Navigation/Breadcrumbs'
import { 
  useQuery, 
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import CustomSearchField from '../../../components/Fields/CustomSearchField';
import WorkIcon from '@mui/icons-material/Work';
import { Plus } from 'lucide-react'
import TableDefault from '../../../components/DataDisplay/TableDefault';
import {
  createOrganization,
  deleteOrganization, 
  fetchOrganization,
  updateOrganization
} from '../../../services/Technician/organizationServices'
import ReusableTextFieldModal from '../../../components/feedback/ReusableTextFieldModal';
import { userAuth } from '../../../hooks/userAuth';
import SnackbarTechnician from '../../../components/feedback/SnackbarTechnician'; 
import AlertDialog from '../../../components/feedback/AlertDialog';

const Organization = () => {
  const queryClient = useQueryClient();
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [searchValue, setSearchValue] = useState<string>("")
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [isEditMode, setIsEditModel] = useState<boolean>(false)
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null)
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([])
  const { 
   setSnackBarOpen,
   setSnackBarMessage,
   setSnackBarType, 
  } = userAuth();

  const columns = [
    {
      id: "name", 
      label: "Name", 
      sortable: true, 
      align: 'left'
    }, 
    {
      id: 'created_at',
      label: "",
      sortable: false,
      align: "right",
    }
  ]

  const { data: organizationResponse, isLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: fetchOrganization
  });

  const organization = organizationResponse?.data || []

  const { mutateAsync: Organization } = useMutation({
    mutationFn: createOrganization
  })

  const { mutateAsync: deleteOrg } = useMutation({
    mutationFn: deleteOrganization
  })

  const { mutateAsync: updateOrg} = useMutation({
    mutationFn: ({id, payload} : { id: number; payload: any}) =>
      updateOrganization(id, payload)
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchValue]) 

  const filterOrganization = useMemo(() => {
    if(!debouncedSearch.trim()) return organization
    return organization.filter((c) =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  },[ organization, debouncedSearch]);

  const handleDelete = async (ids: number[]) => {
    setDeleteIds(ids)
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete ${ids.length} categories?`)
  }

  const handleEdit = (pid: string | number) => {
    const org = organization.find((c: any) => c.pid === pid || c.id === pid);
    if (!org) return;

    setSelectedOrganization(org)
    setIsEditModel(true)
    setModalOpen(true)
  }

  const handleAddOrganization =  async(formDataOrganization: Record<string, string>) => {
    try {
      const formData = new FormData();
      formData.append("name", formDataOrganization.name);

      const response = await Organization(formData);

      if (response?.success) {
        setSnackBarMessage("Organization created successfully")
        setSnackBarType('success')
        setSnackBarOpen(true)

        queryClient.invalidateQueries({queryKey: ['organization']})
      }
    } catch (error) {
      setSnackBarMessage("Failed to submit, please try again.")
      setSnackBarType("error")
      setSnackBarOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteOrg(deleteIds); // call mutation

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        setSnackBarMessage("Category deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        // Refetch categories
        queryClient.invalidateQueries({ queryKey: ['organization'] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to delete category. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }

  const handleUpdateOrganization= async(formDataOrganization: Record<string, string>) => {
    try {
      const payload = new FormData();
      payload.append("name", formDataOrganization.name);

      const response = await updateOrg({
        id: selectedOrganization.id,
        payload
      });

      if (response?.success) {
        setSnackBarMessage("Organization updated successfully");
        setSnackBarType("success")
        setSnackBarOpen(true)

        queryClient.invalidateQueries({
          queryKey: ['organization']
        });

        setModalOpen(false)
        setIsEditModel(false)
      }
    } catch (error) {
      setSnackBarMessage("Failed to update organization")
      setSnackBarType('error')
      setSnackBarOpen(true)
    }
  }
  return (
    <div className='p-6 space-y-10 bg-white'> 

      {/* Dialog */}
      <AlertDialog 
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleConfirmDelete} 
      />

      <ReusableTextFieldModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditMode ? "Edit Organization" : "Add New Organization"}
        fields={[
          {
            name: "name",
            placeholder: "Organization Name",
            maxLength: 100,
            type: 'text',
            multiline: false,
            rows: 1,
            value: isEditMode ? selectedOrganization?.name || "" : "",
            validator: (value) => !value.trim() ? "Name is required" : undefined
          }
        ]}
         onSubmit={isEditMode ? handleUpdateOrganization : handleAddOrganization}
      />
      
      <div className='grid md:grid-cols-2'>
        <div className='flex items-center'>
          <Breadcrumb 
            items={[
              { 
                label: "Job Order", 
                href: "/beesee/job-order", 
                icon: <WorkIcon /> 
              },
              {
                label: "Organization",
                isActive: true,
                icon: <CorporateFareIcon />
              }
            ]} 
          />
        </div>
        <div className='md:flex items-center justify-end md:space-x-4 space-y-2 mt-2 md:mt-0 md:space-y-0'>
          <div>
            <CustomSearchField 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder='Search...'
            />
          </div>
          <div>
            <button
              onClick={() => setModalOpen(true)}
              className='flex items-center gap-2 px-5 py-3 bg-yellow-400 rounded-lg font-semibold'
            >
              <Plus /> Add Organization
            </button>
          </div>
        </div>
      </div>

      <TableDefault 
        columns={columns}
        rows={filterOrganization}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Organization
