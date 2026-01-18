import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import TableDefault from "../../../components/DataDisplay/TableDefault"
import { useState, useEffect, useMemo } from "react"
import { 
  Package,
  Plus, 
} from 'lucide-react'
import { 
  useQuery, 
  useQueryClient, 
  useMutation 
} from "@tanstack/react-query"
import { 
  deleteProducts, 
  fetchProducts, 
  updateProducts,
  createProduct,
  fetchCategories
} from '../../../services/Technician/productServices'
import WorkIcon from '@mui/icons-material/Work';
import ReusableTextFieldModal from "../../../components/feedback/ReusableTextFieldModal"
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician"
import AlertDialog from "../../../components/feedback/AlertDialog"
import { userAuth } from "../../../hooks/userAuth"
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'
import CustomSearchField from "../../../components/Fields/CustomSearchField"

const Product = () => {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([])

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { 
    userInfo,
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
    snackBarMessage ,
    snackBarOpen,
    snackBarType
  } = userAuth()

  const Permission = userInfo?.permissions?.find(p => p.parent_id === 'settings' && p.children_id === 'model');
  
  const { data: productResponse, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });

  const { data: categoryResponse = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    select: (res) => res.data.map((item: any) => ({
      value: item.id,
      label: item.name
    }))
  })

  const { mutateAsync: Products } = useMutation({
      mutationFn: createProduct
  });

  const { mutateAsync: updateProduct } = useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: any }) =>
        updateProducts(id, payload),
  });

  const { mutateAsync: deleteProduct } = useMutation({
    mutationFn: deleteProducts
  });

  const products = productResponse?.data || null 

  const columns = [
    {id: 'product_name', label: 'Model Type', sortable: true, align: 'left'},
    {id: 'category_name', label: 'Device Type', sortable: false, align: 'left'},
    {id: 'created_at', label: '', sortable: false, align: 'right'}
  ];

  const handleDelete = (ids: number[]) => {
    if (Permission?.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete model.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    }
    setDeleteIds(ids)
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete ${ids.length} model?`)
  };

  const handleEdit = (pid : string | number) => { 
    if (Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit model.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    } 
    const product = products.find((c: any) => c.pid === pid || c.id === pid);
    if (!product) return;

    setSelectedProduct(product);
    setIsEditMode(true);
    setModalOpen(true);
  }

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteProduct(deleteIds); // call mutation

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        setSnackBarMessage("Model deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        // Refetch product
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to delete model. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }

  const handleAddProduct = async (formDataProduct: Record<string, string>) => {
    try {
      const formData = new FormData();
      formData.append('name', formDataProduct.product_name);
      formData.append('categories_id', formDataProduct.category)

      const response = await Products(formData)

      if (response?.success) {
        setSnackBarMessage("Product created successfully")
        setSnackBarType('success')
        setSnackBarOpen(true)

        // Refetch product
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to submit, Please try again.")
      setSnackBarType('error')
      setSnackBarOpen(true)
    }
  };

  const handleUpdateProduct= async (formDataProduct: Record<string, string>) => {
    try {
      const payload = {
        name: formDataProduct.product_name,
        categories_id: formDataProduct.category
      };

      const response = await updateProduct({
        id: selectedProduct.id,
        payload
      });

      if (response?.success) {
        setSnackBarMessage("Product updated successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        queryClient.invalidateQueries({ queryKey: ["products"] });
        setModalOpen(false);
      }
    } catch (error) {
      setSnackBarMessage("Failed to update product");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  };

  // --- update debounce after 2 seconds ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 1000);

    return () => clearTimeout(timer)
  }, [searchValue]);

  // --- Memoized filtered product
  const filteredProduct = useMemo(() => {
    if (!debouncedSearch?.trim()) return products
    return products.filter((c: any) => 
      c.product_name.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      c.category_name.toLowerCase().includes(debouncedSearch?.toLowerCase())
    )
  }, [products, debouncedSearch])

  if (isLoading) return <SpinningRingLoader />

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

      <ReusableTextFieldModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditMode ? "Edit Product" : "Add New Product"}
        fields={[
          {
            name: 'product_name',
            placeholder: 'Product Name', 
            type: 'text',
            multiline: false,
            rows: 1,
            value: isEditMode ? selectedProduct?.product_name  : "",
            validator: (value) => !value.trim() ? 'Name is required' : undefined
          },
          {
            name: "category",
            placeholder: "Select category",
            type: "select",
            value: isEditMode ? selectedProduct?.categories_id  : "",
            options: categoryResponse,
            validator: (v) => !v ? "Category is required" : undefined
          },
        ]}
        onSubmit={isEditMode ? handleUpdateProduct : handleAddProduct}
      />

      {/* Header Section - Responsive layout */}
      <div className='flex flex-col lg:grid lg:grid-cols-2 gap-4'>
        {/* Breadcrumb Section */}
        <div className="flex items-center w-full">
          <Breadcrumb 
            items={[
              { label: "Model Type", isActive: true, icon: <Package /> },
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
              placeholder='Search products...'
              className="w-full"
            />
          </div>
          
          {/* Add Button - Full width on mobile, auto width on larger screens */}
          {Permission?.actions.includes('add') && 
            <div className="w-full sm:w-auto">
              <button   
                onClick={() => {
                  setModalOpen(true);
                  setIsEditMode(false); 
                }} 
                className='flex items-center justify-center gap-2 px-4 py-3 w-full sm:w-auto bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm sm:text-base'
              >
                <Plus size={18} className="sm:size-5" /> 
                <span className="whitespace-nowrap">Add Model Type</span>
              </button>
            </div>
          }
        </div>
      </div>

      {/* Table Section */}
      <TableDefault 
        rows={filteredProduct}
        columns={columns}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Product