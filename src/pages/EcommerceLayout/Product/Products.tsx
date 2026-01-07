import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertColor } from '@mui/material/Alert';
import { 
    Home, 
    Box, 
    Plus,  
    TrendingUp,
    Package, 
} from 'lucide-react';

import Breadcrumb from '../../../components/Navigation/Breadcrumbs';
import ProductTable from '../../../components/DataDisplay/ProductTable';
import CustomSelectField from '../../../components/Fields/CustomSelectField';
import AlertDialog from '../../../components/feedback/AlertDialog';
import Snackbar from '../../../components/feedback/Snackbar';
import { 
    deleteProduct, 
    fetchAllProduct, 
    fetchCategory,
    countProduct
} from '../../../services/Ecommerce/productServices';


interface Product {
    id: number;
    name: string;
    tagline?: string;
    stock: number;
    status: string;
    category_id: number;
    created_at: string;
}

const Products = () => {
    const navigate = useNavigate(); 
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all'); 
    const [message, setMessage] = useState("");
    const [snackBarType, setSnackBarType] = useState<AlertColor>("success");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | string>(0);
    const [title, setTitle] = useState<string>(""); 
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("")

    // --- fetch all product ---
    const { data: productResponse } = useQuery({
        queryKey: ["product"],
        queryFn: () => fetchAllProduct()
    });

    // --- count all product ---
    const { data: countData } = useQuery({
        queryKey: ["count"],
        queryFn: () => countProduct()   
    })

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

    // combines products with category names
    const productsWithCategory = useMemo(() => {
        if (!productResponse || category.length === 0) return [];

        return (productResponse as Product[]).map((product) => {
            const matchedCategory = category.find(
                (c) => c.value === product.category_id
            );
            return {
                ...product,
                category: matchedCategory ? matchedCategory.label : "Unknown"
            }
        })
    }, [productResponse, category]);

    // 🧩 Filter products by status or category
    const filteredProducts = useMemo(() => {
        let filtered = productsWithCategory;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(
                (p) => p.status.toLowerCase() === filterStatus.toLowerCase()
            );
        }

        if (filterCategory !== 'all') {
            filtered = filtered.filter(
                (p) => p.category_id === Number(filterCategory)
            );
        } 

        return filtered;
    }, [productsWithCategory, filterStatus, filterCategory]);
    
    const columns = [
        { id: 'name', label: 'Product Name', numeric: false, disablePadding: false },
        { id: 'tagline', label: 'Tagline', numeric: false, disablePadding: false },
        { id: 'category', label: 'Category', numeric: false, disablePadding: false }, 
    ];  

    // --- asking if delete information ---
    const handleVerifyDelete = (id: number | string, status: string) => {  
        setStatus(status)
        setDeleteId(id)
        setOpenModal(true)
        setTitle(`${status == "Active" ? "Product Confirmation" : "Product Confirmation"}`);
        setMessage(`${status === "Active" ? 'This action cannot be undone. Are you sure you want to deactivated this product?': "This action cannot be undone. Are you sure you want to activated this product?"}`);
    }

    // --- form editing information ---
    const handleRowEdit = (id: number | string) => { 
        navigate(`/beesee/product/form/${id}`)
    }

    // --- close modal ---
    const handleCloseModal = () => {
        setOpenModal(false)
        setDeleteId(0)
        setTitle("")
        setMessage("")
    }

    // --- pass data on api ---
    const { 
        mutateAsync: deleteProductAsync, 
        isPending
    } = useMutation({
        mutationFn: deleteProduct,
    });

    // refetch the category list when deleted
    const queryClient = useQueryClient();
    

    const handleDeleteRow = async () => {
        try {
            await deleteProductAsync(deleteId);
            setSnackBarType("success");
            setMessage(`${status === "Active" ? "The product has been deactivated successfully." : "The product has been activated successfully."}`) 

            // trigger refetch
            queryClient.invalidateQueries({ queryKey: ["product"] })
        } catch (error) {
            setSnackBarType("error");
            setMessage("Failed to disabled the product. Please try again.");
        } finally {
            setOpenModal(false);
            setShowAlert(true);
            setDeleteId(0);
            setTitle("");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Modal Component */}
                <AlertDialog 
                    open={openModal}
                    title={title}
                    message={message}
                    onClose={handleCloseModal}
                    onSubmit={handleDeleteRow}
                    isLoading={isPending}
                />

                {/* Notification */} 
                <Snackbar 
                    open={showAlert}
                    type={snackBarType}
                    message={message}
                    onClose={() => setShowAlert(false)}
                />

                {/* Breadcrumb */}
                <div className="mb-6">
                    <Breadcrumb
                        items={[
                            { label: 'Home', href: '/beesee/dashboard', icon: <Home className="w-4 h-4" /> },
                            { label: 'Products', isActive: true, icon: <Box className="w-4 h-4" /> },
                        ]}
                    />
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
                        
                        <button
                            onClick={() => navigate('/beesee/product/form')}
                            className="flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                </div>
                
                {/* Filters and Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1"> 
                            <div className="md:flex gap-3">
                                <CustomSelectField
                                    name="filterCategory"
                                    placeholder="All Categories"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    options={category}
                                />

                                <CustomSelectField
                                    name="filterStatus"
                                    placeholder="All Status"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'All Status' },
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' },
                                       /*  { value: 'out_of_stock', label: 'Out of Stock' } */
                                    ]}
                                />
 
                            </div>
                        </div> 
                    </div>
                </div>

                {/* if you want to grid view or table */}
                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    {filteredProducts.length === 0 ? (
                        <div className='text-center py-12'>
                            <Box className='mx-auto h-12 w-12 text-gray-400 mb-4'/>
                            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                                No product yet
                            </h3>
                            <p className='text-gray-600 dark:text-gray-400 mb-6'>
                                Start adding products
                            </p>
                            <button 
                                onClick={() => navigate('/beesee/product/form')}
                                className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all'
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Products
                            </button>
                        </div>
                    ) : (
                        <ProductTable 
                            rows={filteredProducts}
                            columns={columns}
                            handleRowEdit={handleRowEdit}
                            handleRowDelete={handleVerifyDelete}
                        /> 
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;