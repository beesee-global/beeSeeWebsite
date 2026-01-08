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
import Snackbar from "../../../components/feedback/Snackbar"
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
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
    snackBarMessage ,
    snackBarOpen,
    snackBarType
  } = userAuth()
  
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
    setDeleteIds(ids)
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete ${ids.length} products?`)
  };

  const handleEdit = (pid : string | number) => { 
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
        setSnackBarMessage("Product deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);

        // Refetch product
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to delete product. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }

  const handleAddProduct = async (formDataProduct: Record<string, string>) => {
    try {
      const formData = new FormData();
      formData.append('name', formDataProduct.name);
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
        title={isEditMode ? "Edit Product" : "Add New Product"}
        fields={[
          {
            name: 'product_name',
            placeholder: 'Product Name',
            maxLength: 100,
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

      <div className='grid md:grid-cols-2'>
        <div className="flex items-center">
          <Breadcrumb 
            items={[
              { label: "Job Order", href: "/beesee/job-order", icon: <WorkIcon className="w-4 h-4"/> }, 
              { label: "Model Type", isActive: true, icon: <Package /> },
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
            <button onClick={() => setModalOpen(true)} className='flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md'>
              <Plus /> Add Model Type
            </button>
          </div>
        </div>
      </div>

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
