import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { AlertColor } from '@mui/material/Alert';
import { 
    Home, 
    Tag, 
    Plus, 
} from 'lucide-react';

import Breadcrumb from '../../../components/Navigation/Breadcrumbs';
import CategoryTable from '../../../components/DataDisplay/CategoryTable';
import AlertDialog from '../../../components/feedback/AlertDialog';
import Snackbar from '../../../components/feedback/Snackbar';
import { 
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { 
    deleteCategory, 
    fetchAllCategory 
} from '../../../services/categoryServices';

interface Category {
    id: number;
    name: string;
    description: string;
    productCount: number;
    createdAt: string;
    updatedAt: string;
}

const Category = () => {
    const navigate = useNavigate();  
    const [message, setMessage] = useState<string>('');
    const [snackBarType, setSnackBarType] = useState<AlertColor>('success');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | string>(0);
    const [title, setTitle] = useState<string>('');
    const [openModal, setOpenModal] = useState<boolean>(false);

    const columns = [ 
        { id: 'name', label: 'Category Name', numeric: false, disablePadding: false }, 
    ];

    // fetch all data
    const {
        data: categoryResponse
    } = useQuery({
        queryKey: ["category"],
        queryFn: () => fetchAllCategory()
    });

    // --- pass data on api ---
    const { 
        mutateAsync: deleteCategoryAsync, 
        isPending 
    } = useMutation({
        mutationFn: deleteCategory,
    });

    // extract array safety
    const categoryInfo = categoryResponse || []; // <-- this is now Row[]

    // refetch the category list when deleted
    const queryClient = useQueryClient();

    // --- form editing information ---
    const handleRowEdit = (id: number | string) => {
        navigate(`/beesee/category/form/${id}`);
    };

    // --- asking if delete information ---
    const handleVerifyDelete = (id: number | string) => {
        setDeleteId(id);
        setOpenModal(true);
        setTitle('Delete Category Confirmation');
        setMessage(`This action cannot be undone. Are you sure you want to delete this category?`);
    };

    const handleDeleteRow = async () => {
        try {
            const response = await deleteCategoryAsync(deleteId);

            // Check backend success flag
            if (response.success) {
                setSnackBarType('success');
                setMessage('The category has been disabled successfully.');
                
               // trigger refetch
                queryClient.invalidateQueries(["category"]);
            } else {
                setSnackBarType('error');
                setMessage(response.message || 'Cannot delete category because it is used in other records.');
            }

        } catch (error) {
            setSnackBarType('error');
            setMessage('Failed to disabled the category. Please try again.');
        } finally {
            setOpenModal(false);
            setShowAlert(true);
            setDeleteId(0);
            setTitle('');
        }
    };

    // --- close modal ---
    const handleCloseModal = () => {
        setOpenModal(false);
        setDeleteId(0);
        setTitle('');
        setMessage('');
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
                            { label: 'Categories', isActive: true, icon: <Tag className="w-4 h-4" /> },
                        ]}
                    />
                </div>

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Categories</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage your product categories and organization</p>
                        </div>

                        <button
                            onClick={() => navigate('/beesee/category/form')}
                            className="flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90
                            hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Category
                        </button>
                    </div>
                </div>
 
                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    {categoryInfo.length === "0" ? (
                        <div className='text-center py-12'>
                            <Tag className='mx-auto h-12 w-12 text-gray-400 mb-4'/>
                            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                                No category yet
                            </h3>
                            <p className='text-gray-600 dark:text-gray-400 mb-6'>
                                Start adding category
                            </p>
                            <button 
                                onClick={() => navigate('/beesee/category/form')}
                                className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all'
                            >
                                <Plus className='w-4 h-4 mr-2'/>
                                Add Category
                            </button>
                        </div>
                    ) : (
                        <CategoryTable 
                            rows={categoryInfo} 
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

export default Category;
