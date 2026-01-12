import { useState, useMemo, useEffect } from 'react';
import Breadcrumb from '../../../components/Navigation/Breadcrumbs' 
import { 
  useQuery, 
  useMutation, 
  useQueryClient  
} from '@tanstack/react-query';
import { 
  School as SchoolIcon, 
} from 'lucide-react';

import WorkIcon from '@mui/icons-material/Work';
import {  
  fetchSchools, 
  createSchool, 
  deleteSchool,
  updateSchool 
} from '../../../services/Technician/schoolServices'
import { Plus } from 'lucide-react'
import { userAuth } from '../../../hooks/userAuth';
import TableDefault from '../../../components/DataDisplay/TableDefault' 
import ReusableTextFieldModal from '../../../components/feedback/ReusableTextFieldModal';
import Snackbar from '../../../components/feedback/Snackbar';
import AlertDialog from '../../../components/feedback/AlertDialog';
import CustomSearchField from '../../../components/Fields/CustomSearchField';

const Schools = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([])

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { 
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
    snackBarMessage ,
    snackBarOpen,
    snackBarType
  } = userAuth()

  const { data: schoolResponse, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: fetchSchools
  }); 

  // Extract data array from response
  // Adjust based on your API response structure
  const schools = schoolResponse?.data || []; // If API returns { data: [...] } 

  const { mutateAsync: School } = useMutation({
    mutationFn: createSchool
  });

  const { mutateAsync: deleteSchools} = useMutation({
    mutationFn: deleteSchool
  });

  const { mutateAsync: updateSchools } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      updateSchool(id, payload),
  });

  const queryClient = useQueryClient();

  // Custom columns
  const customColumns = [
    { id: 'name', label: 'School Name', sortable: true, align: "left" }, 
    { id: 'created_at', label: '', sortable: false, align: "right" },
  ];

  const handleDelete = async(ids: number[]) => { 
    setDeleteIds(ids)
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete ${ids.length} schools?`)
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteSchools(deleteIds); // call mutation

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        setSnackBarMessage("School deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        // Refetch categories
        queryClient.invalidateQueries({ queryKey: ['schools'] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to delete school. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }

  const handleEdit = (pid : string | number) => {
    const school = schools.find((c: any) => c.pid === pid || c.id === pid);
    if (!school) return;

    setSelectedSchool(school);
    setIsEditMode(true);
    setModalOpen(true);
  }
  
  const handleAddSchool = async (formDataSchool: Record<string, string>) => {
    try {
      const formData = new FormData();
      formData.append('name', formDataSchool.name);
      const response = await School(formData)

      if (response?.success) {
        setSnackBarMessage("School created successfully")
        setSnackBarType('success')
        setSnackBarOpen(true)

        // Refetch categories
        queryClient.invalidateQueries({ queryKey: ['schools'] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to submit, Please try again.")
      setSnackBarType('error')
      setSnackBarOpen(true)
    }
  };

  const handleUpdateSchool = async (formDataSchool: Record<string, string>) => {
    try {
      const payload = {
        name: formDataSchool.name,
      };

      const response = await updateSchools({
        id: selectedSchool.id,
        payload
      });

      if (response?.success) {
        setSnackBarMessage("School updated successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        queryClient.invalidateQueries({ queryKey: ["schools"] });
        setModalOpen(false);
      }
    } catch (error) {
      setSnackBarMessage("Failed to update school");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 1000);

    return () => clearTimeout(timer)
  }, [searchValue])

  const filteredSchool = useMemo(() => {
    if (!debouncedSearch.trim()) return schools
    return schools.filter((c: any) => 
    c.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
  }, [schools, debouncedSearch])
  
  return (
    <div className='p-6 space-y-10 bg-white'>
      {/* Snackbar */}
      <Snackbar 
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

      <ReusableTextFieldModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditMode ? "Edit School" : "Add New School"}
        fields={[
          {
            name: 'name',
            placeholder: 'School Name',
            maxLength: 100,
            type: 'text',
            multiline: false,
            rows: 1,
            value: isEditMode ? selectedSchool?.name || "" : "",
            validator: (value) => !value.trim() ? 'Name is required' : undefined
          }
        ]}
        onSubmit={isEditMode ? handleUpdateSchool : handleAddSchool}
      />

      <div className='grid md:grid-cols-2'>
        <div className='flex items-center'>
          <Breadcrumb 
            items={[
              { label: "Job Order", href: "/beesee/job-order", icon: <WorkIcon /> }, 
              { label: "School", isActive: true, icon: <SchoolIcon /> },
            ]}
          />
        </div>
        <div className='md:flex items-center justify-end md:space-x-4 space-y-2 mt-2 md:mt-0 md:space-y-0'>
          <div>
            <CustomSearchField 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder='Search by name'
            />
          </div>
          <div>
            <button onClick={() => setModalOpen(true)} className='flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md'>
              <Plus /> Add School
            </button>
          </div>
        </div>
      </div>

      <TableDefault 
        rows={filteredSchool}
        columns={customColumns}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Schools
