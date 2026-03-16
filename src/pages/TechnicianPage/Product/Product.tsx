import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import TableDefault from "../../../components/DataDisplay/TableDefault"
import { useState, useEffect, useMemo } from "react"
import { 
  Package,
  Plus, 
  Pencil,
  Trash2
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
} from '../../../services/Technician/productServices' 
import {
  fetchCategoriesNoIsActive
} from '../../../services/Technician/categoryServices'
import ReusableTextFieldModal from "../../../components/feedback/ReusableTextFieldModal" 
import AlertDialog from "../../../components/feedback/AlertDialog"
import { userAuth } from "../../../hooks/userAuth"
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'
import CustomSearchField from "../../../components/Fields/CustomSearchField"
import TableCustomizableHeaders from '../../../components/DataDisplay/TableCustomizableHeaders'

const Product = () => {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null); 
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { 
    userInfo,
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
  } = userAuth()

  const Permission = userInfo?.permissions?.find(p => p.parent_id === 'settings' && p.children_id === 'model');
  
  const { data: productResponse, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });

  const { data: categoryResponse = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoriesNoIsActive,
    select: (res) => res.data.map((item: any) => ({
      value: item.id,
      label: item.name
    }))
  })
 
  const TabHeaders = ["ALL", ...categoryResponse.map((c: any) => c.label)] 

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
    {id: 'category_name', label: 'Device Type', sortable: true, align: 'left'},
    {id: 'created_at', label: '', sortable: false, align: 'right'}
  ];

      // Handle Delete Button Click
  const handleDeleteClick = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select an model first");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }

    if (!Permission?.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete model. Once deleted, all connected Job Order will also be removed.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }

    setDeleteIds([selectedRowId]);
    setDialogTitle("Confirm Delete");
    setDialogOpen(true);
    setDialogMessage("Are you sure you want to delete this model?");
  }; 

  const handleUpdate = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select an model first");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }

    if (!Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit model.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }

    const product = products.find((f: any) => f.id === selectedRowId);
    if (!product) return;
    
    setSelectedProduct(product);
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("ids", JSON.stringify(deleteIds)); 
      formData.append("user_id", String(userInfo?.id));  
      const response = await deleteProduct(formData); // call mutation

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
      formData.append('user_id', String(userInfo?.id)); // Include user_id in the payload

      const response = await Products(formData)

      if (response?.success) {
        setSnackBarMessage("Model created successfully")
        setSnackBarType('success')
        setSnackBarOpen(true)

        // Refetch product
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    } catch (error) {
      const message = error?.response?.data?.message?.replace(/^Error:\s*/, '');
 
      setSnackBarMessage(message)
      setSnackBarType('error')
      setSnackBarOpen(true)
    }
  };

  const handleUpdateProduct= async (formDataProduct: Record<string, string>) => {
    try {
      const payload = {
        name: formDataProduct.product_name,
        categories_id: formDataProduct.category,
        user_id: userInfo?.id // Include user_id in the payload
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
      const message = error?.response?.data?.message?.replace(/^Error:\s*/, '');
 
      setSnackBarMessage(message)
      setSnackBarType('error')
      setSnackBarOpen(true) 
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
    if (!debouncedSearch?.trim()) {
      // Apply category filter only
      if (selectedFilter === "ALL") {
        return products;
      }
      return products.filter((c: any) => c.category_name === selectedFilter);
    }
    
    // Apply both search and category filter
    let result = products.filter((c: any) => 
      c.product_name.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      c.category_name.toLowerCase().includes(debouncedSearch?.toLowerCase())
    );
    
    if (selectedFilter !== "ALL") {
      result = result.filter((c: any) => c.category_name === selectedFilter);
    }
    
    return result;
  }, [products, debouncedSearch, selectedFilter]);

  const isUpdateEnabled = !!selectedRowId;
  const isDeleteEnabled = !!selectedRowId

  // Handle Row Click (Select)
  const handleRowClick = (row: any) => {
    setSelectedRowId(row.id);
  };

  // Handle Row Double Click (Edit)
  const handleRowDoubleClick = (row: any) => {
    if (!Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit product.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }
    
  const product = products.find((f: any) => f.id === row.id);
    if (!product) return;
    
    setSelectedProduct(product);
    setIsEditMode(true);
    setModalOpen(true);
  };

  if (isLoading) return <SpinningRingLoader />

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
            placeholder: "Select device",
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
      <TableCustomizableHeaders 
        rows={filteredProduct}
        columns={columns}
        isLoading={isLoading}
        selectedRowId={selectedRowId}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        filterOptions={TabHeaders}
        selectedFilter={selectedFilter}
        onFilterChange={(filter) => setSelectedFilter(filter)}
      />
    </div>
  )
}

export default Product