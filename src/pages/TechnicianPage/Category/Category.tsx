import { useState, useMemo, useEffect } from 'react';
import Breadcrumb from '../../../components/Navigation/Breadcrumbs'
import CategoryIcon from '@mui/icons-material/Category';
import { 
  useQuery, 
  useMutation, 
  useQueryClient  
} from '@tanstack/react-query';
import { 
  fetchCategories, 
  createCategories, 
  deleteCategories,
  updateCategories 
} from '../../../services/Technician/categoryServices'
import { Plus } from 'lucide-react'
import { userAuth } from '../../../hooks/userAuth';
import TableDefault from '../../../components/DataDisplay/TableDefault' 
import ReusableTextFieldModal from '../../../components/feedback/ReusableTextFieldModal';
import Snackbar from '../../../components/feedback/Snackbar';
import AlertDialog from '../../../components/feedback/AlertDialog';
import CustomSearchField from '../../../components/Fields/CustomSearchField';
import WorkIcon from '@mui/icons-material/Work';
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'

const Category = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([])

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
 
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { 
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
    snackBarMessage ,
    snackBarOpen,
    snackBarType
  } = userAuth()
 
  const { data: categoryResponse, isLoading } = useQuery({
    queryKey: ['category'],
    queryFn: fetchCategories
  }); 

  // Extract data array from response
  // Adjust based on your API response structure
  const categories = categoryResponse?.data || []; // If API returns { data: [...] } 

  const { mutateAsync: Category, isPending } = useMutation({
    mutationFn: createCategories
  });

  const { mutateAsync: deleteCategory } = useMutation({
    mutationFn: deleteCategories
  });

  const { mutateAsync: updateCategory } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      updateCategories(id, payload),
  });

  const queryClient = useQueryClient();

  // Custom columns
  const customColumns = [
    { id: 'name', label: 'Name', sortable: true, align: "left" }, 
    { id: 'created_at', label: '', sortable: false, align: "right" },
  ];

  const handleDelete = async(ids: number[]) => { 
    setDeleteIds(ids)
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete ${ids.length} categories?`)
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteCategory(deleteIds); // call mutation

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        setSnackBarMessage("Category deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        // Refetch categories
        queryClient.invalidateQueries({ queryKey: ['category'] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to delete category. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }

  const handleEdit = (pid : string | number) => {
    const category = categories.find((c: any) => c.pid === pid || c.id === pid);
    if (!category) return;

    setSelectedCategory(category);
    setIsEditMode(true);
    setModalOpen(true);
  }
 
  const handleAddCategory = async (formDataCategory: Record<string, string>) => {
    try {
      const formData = new FormData();
      formData.append('name', formDataCategory.name);
      const response = await Category(formData)

      if (response?.success) {
        setSnackBarMessage("Category created successfully")
        setSnackBarType('success')
        setSnackBarOpen(true)

        // Refetch categories
        queryClient.invalidateQueries({ queryKey: ['category'] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to submit, Please try again.")
      setSnackBarType('error')
      setSnackBarOpen(true)
    }
  };

  const handleUpdateCategory = async (formDataCategory: Record<string, string>) => {
    try {
      const payload = {
        name: formDataCategory.name,
      };

      const response = await updateCategory({
        id: selectedCategory.id,
        payload
      });

      if (response?.success) {
        setSnackBarMessage("Category updated successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        queryClient.invalidateQueries({ queryKey: ["category"] });
        setModalOpen(false);
      }
    } catch (error) {
      setSnackBarMessage("Failed to update category");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  };

  // --- update debounce after 3 seconds ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 1000);

    return () => clearTimeout(timer)
  }, [searchValue]);

  // --- Memoized filtered categories ---
  const filteredCategory = useMemo(() => {
    if (!debouncedSearch.trim()) return categories
    return categories.filter((c: any) =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [categories, debouncedSearch])

  if (isLoading) return <SpinningRingLoader />

  return (
    <div className='p-6 space-y-10'>
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
        title={isEditMode ? "Edit Category" : "Add New Category"}
        fields={[
          {
            name: 'name',
            placeholder: 'Category Name',
            maxLength: 100,
            type: 'text',
            multiline: false,
            rows: 1,
            value: isEditMode ? selectedCategory?.name || "" : "",
            validator: (value) => !value.trim() ? 'Name is required' : undefined
          }
        ]}
        onSubmit={isEditMode ? handleUpdateCategory : handleAddCategory}
      />

      <div className='grid md:grid-cols-2'>
        <div className='flex items-center'>
          <Breadcrumb 
            items={[
              { label: "Job Order", href: "/beesee/job-order", icon: <WorkIcon className="w-4 h-4"/> }, 
              { label: "Device Type", isActive: true, icon: <CategoryIcon /> },
            ]}
          />
        </div>
        <div className='md:flex items-end justify-end md:space-x-4 space-y-2 mt-2 md:mt-0 md:space-y-0'>
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
              className='flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md'>
              <Plus /> Add Device Type
            </button>
          </div>
        </div>
      </div>

      <TableDefault 
        rows={filteredCategory}
        columns={customColumns}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Category