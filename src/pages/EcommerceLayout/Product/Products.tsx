import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertColor } from '@mui/material/Alert';
import {    
    Box, 
    Plus,  
    Trash2,
    Pencil,
    TrendingUp,
    Package, 
} from 'lucide-react';

import Breadcrumb from '../../../components/Navigation/Breadcrumbs';
import AlertDialog from '../../../components/feedback/AlertDialog';
import { userAuth } from '../../../hooks/userAuth';
import SnackbarTechnician from '../../../components/feedback/SnackbarTechnician';
import CustomSearchField from '../../../components/Fields/CustomSearchField';
import ProductTable from './components/ProductTable';
import { 
    deleteProduct, 
    fetchAllProduct, 
    fetchCategory,
    countProduct
} from '../../../services/Ecommerce/productServices';

const Products = () => {
    const navigate = useNavigate();  
    const queryClient = useQueryClient();
    const [searchValue, setSearchValue] = useState<string>("");
    const [dialogOpen , setDialogOpen] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>("");
    const [dialogTitle, setDialogTitle] = useState<string>("");
    const [deleteIds, setDeleteIds] = useState<number[]>([]) 
    const [debouncedSearch, setDebouncedSearch] = useState<string>("")
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

    const {
        setSnackBarMessage,
        setSnackBarOpen,
        setSnackBarType,
        snackBarMessage,
        snackBarType,
        snackBarOpen,
    } = userAuth();

    // --- fetch all product ---
    const { data: productResponse, isLoading } = useQuery({
        queryKey: ["product"],
        queryFn: () => fetchAllProduct()
    });

    // --- pass data on api ---
    const { 
        mutateAsync: deleteProductAsync, 
        isPending
    } = useMutation({
        mutationFn: deleteProduct,
    });

    const productsInfo = productResponse?.data || []
 
    // --- fetch all category --- 
    const {
        data: category = []
    } = useQuery({
        queryKey: ["category"],
        queryFn: () => fetchCategory(),
        select: (data) => {
            // map api result into label /value pair
            const mapped = data.map((item: {id: number; name: string; }) => ({
                value: item.id,
                label: item.name
            }));

            return [
                { value: "all", label: 'All Category'},
                ...mapped
            ]
        }
    }) 
    
    const columns = [
        { id: 'name', label: 'Product Name', numeric: false, disablePadding: false },
        { id: 'tagline', label: 'Tagline', numeric: false, disablePadding: false },
        { id: 'category_name', label: 'Category', numeric: false, disablePadding: false }, 
    ];  

    const filteredProducts = useMemo(() => {
        if (!debouncedSearch?.trim()) return productsInfo

        return productsInfo.filter((u: any) => 
            u.name.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
            u.category_name.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
            u.tagline.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
            u.description.toLowerCase().includes(debouncedSearch?.toLowerCase())
        )
    }, [productsInfo, debouncedSearch])

    const handleRowClick = (row: any) => {
        setSelectedRowId(row.id);
    }

    const handleRowDoubleClick = (row:any) => {
        navigate(`/beesee/ecommerce/product/form/${row.pid}`)
    }

    const handleUpdate = () => {
        if (!selectedRowId) {
            setSnackBarMessage("Please select a product first")
            setSnackBarType("warning")
            setSnackBarOpen(true)
            return
        }

        const selectedProduct = productsInfo.find((p: any) => p.id === selectedRowId)
        if (selectedProduct) {
            navigate(`/beesee/ecommerce/product/form/${selectedProduct.pid}`)
        }
    }

    const handleDelete = async () => {
        if (!selectedRowId) {
            setSnackBarMessage("Please select a product first")
            setSnackBarType("warning")
            setSnackBarOpen(true)
            return
        }

        setDeleteIds([selectedRowId])
        setDialogTitle("Confirm Delete")
        setDialogOpen(true)
        setDialogMessage(`Are you sure you want to delete this category?`)
    }

    const handleConfirmDelete = async () => {
        try {
            const response = await deleteProductAsync(Number(deleteIds));

            if (response?.success) {
                setDialogOpen(false)
                setDialogMessage('')
                setDialogTitle("")
                setSelectedRowId(null)
                setSnackBarMessage("Product deleted successfully");
                setSnackBarType("success");
                setSnackBarOpen(true);

                // Refetch jobs
                queryClient.invalidateQueries({ queryKey: ['product'] });
            }
        } catch (error) {
            if (error?.response?.status === 409) {
                setSnackBarMessage(error?.response?.data.message)
                setDialogOpen(false)
                setDialogMessage('')
                setDialogTitle("")
                setSelectedRowId(null)
            }   else {
                
                setSnackBarMessage("Failed to delete product. Please try again.");
            }
            setSnackBarType("error");
            setSnackBarOpen(true);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue)
        }, 1000)
        return () => clearTimeout(timer)
    }, [searchValue])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8"> 

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

                {/* Breadcrumb */}
                <div className="mb-6 flex flex-co; md:flex-row md:items-center md: justify-between gap-4">
                    <div>
                        <Breadcrumb
                            items={[ 
                                { label: 'Products', isActive: true, icon: <Box className="w-4 h-4" /> },
                            ]}
                        />
                    </div>

                    <div className='w-full md:w-64'>
                        <CustomSearchField 
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search..."
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Products
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage your product inventory and catalog
                            </p>
                        </div>
                        
                        <div className='flex gap-2'>
                            <button
                                onClick={() => navigate('/beesee/ecommerce/product/form')}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Product
                            </button>

                            {/* Update Button - Always show, just disable if no selection */}
                            <button 
                                onClick={handleUpdate}
                                disabled={!selectedRowId}
                                className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                                style={{
                                background: selectedRowId ? '#15803d' : '#9ca3af',
                                }}
                            >
                                <Pencil size={18} /> 
                                <span className="whitespace-nowrap">Update</span>
                            </button> 

                            {/* Delete Button */}
                            <button 
                                onClick={handleDelete}
                                disabled={!selectedRowId}
                                className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                                style={{
                                    background: selectedRowId ? '#dc2626' : '#9ca3af',
                                }}
                                >
                                <Trash2 size={18} /> 
                                <span className="whitespace-nowrap">Delete</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                {/* div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{countData?.total_product}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Products</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{countData?.active}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 dark:bg-red-700 rounded-lg">
                                <Box className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">Inactive Products</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{countData?.inactive}</p>
                            </div>
                        </div>
                    </div>
                </div> */}
            
                {/* if you want to grid view or table */}
                {/* Content */} 

                <ProductTable 
                    rows={filteredProducts}
                    columns={columns}
                    selectedRowId={selectedRowId}
                    onRowClick={handleRowClick}
                    onRowDoubleClick={handleRowDoubleClick}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default Products;