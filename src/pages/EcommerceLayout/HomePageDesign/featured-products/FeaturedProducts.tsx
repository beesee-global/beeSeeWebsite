import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react';

import Breadcrumb from '../../../../components/Navigation/Breadcrumbs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import CustomSearchField from '../../../../components/Fields/CustomSearchField';
import { userAuth } from '../../../../hooks/userAuth';
import AlertDialog from '../../../../components/feedback/AlertDialog';
import SnackbarTechnician from '../../../../components/feedback/SnackbarTechnician';
import { fetchAll, deleteFeatured } from '../../../../services/Ecommerce/featureProduct'
import TableDefault from '../../../../components/DataDisplay/TableDefault'

const FeaturedProducts = () => {
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>('');
    const [dialogTitle, setDialogTitle] = useState<string>('');
    const [deleteIds, setDeleteIds] = useState<number[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

    const { snackBarMessage, snackBarType, snackBarOpen, setSnackBarMessage, setSnackBarOpen, setSnackBarType } = userAuth();
    
    // refetch the category list when deleted
    const queryClient = useQueryClient();

    const { 
        data: FeaturedData,
        isLoading
    } = useQuery({
        queryKey: ["featured"],
        queryFn: () => fetchAll()
    });

    // --- pass data on api ---
    const { 
        mutateAsync: deleteFeatures,  
    } = useMutation({
        mutationFn: deleteFeatured,
    });
    

    const columns = [ 
        { id: 'title', label: 'Title', sortable: true, align: 'left' },
        { id: 'name', label: 'Name', sortable: true, align: 'left' },
    ];

    
    const filteredProduct= useMemo(() => {
        if (!debouncedSearch?.trim()) return FeaturedData 
            return FeaturedData.filter((u: any) => 
            u.name.toLowerCase().includes(debouncedSearch?.toLowerCase()) || 
            u.icon.toLowerCase().includes(debouncedSearch?.toLowerCase())
        )
    }, [FeaturedData, debouncedSearch]);

    const handleRowClick = (row: any) => {
        setSelectedRowId(row.id);
    }

    const handleRowDoubleClick = (row:any) => {
        navigate(`/beesee/ecommerce/feature-product/form/${row.pid}`)
    }

    const handleUpdate = () => {
        if (!selectedRowId) {
            setSnackBarMessage("Please select a category first")
            setSnackBarType("warning")
            setSnackBarOpen(true)
            return
        }

        const selectedCategory = FeaturedData.find((j: any) => j.id === selectedRowId);
        if (selectedCategory) {
            navigate(`/beesee/ecommerce/feature-product/form/${selectedCategory.pid}`)
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
        setDialogMessage(`Are you sure you want to delete this featured product?`)
    }

    const handleConfirmDelete = async () => {
        try {
            const response = await deleteFeatures(Number(deleteIds));

            if (response?.success) {
                setDialogOpen(false)
                setDialogMessage('')
                setDialogTitle("")
                setSelectedRowId(null)
                setSnackBarMessage("Featured deleted successfully");
                setSnackBarType("success");
                setSnackBarOpen(true);

                // Refetch jobs
                queryClient.invalidateQueries({ queryKey: ['featured'] });
            }
        } catch (error) {
            if (error?.response?.status === 409) {
                setSnackBarMessage(error?.response?.data.message)
                setDialogOpen(false)
                setDialogMessage('')
                setDialogTitle("")
                setSelectedRowId(null)
            }   else {
                
                setSnackBarMessage("Failed to delete featured. Please try again.");
            }
            setSnackBarType("error");
            setSnackBarOpen(true);
        }
    }

    // debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue)         
        },  1000);
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

                {/* Breadcrumb + Search Row */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Breadcrumb */}
                    <div>
                        <Breadcrumb 
                            items={[{ label: 'Featured Product', isActive: true, icon: <Tag className="w-4 h-4" /> }]} />
                    </div>

                    {/* Search Field */}
                    <div className="w-full md:w-64">
                        <CustomSearchField value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search..." className="w-full" />
                    </div>
                </div>

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Product</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage your product and organization</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/beesee/ecommerce/feature-product/form')}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90
                                hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Featured Product
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

                {/* Table Section */}
                <TableDefault 
                    rows={filteredProduct}
                    columns={columns}
                    isLoading={isLoading}
                    selectedRowId={selectedRowId}
                    onRowClick={handleRowClick}
                    onRowDoubleClick={handleRowDoubleClick}
                />
            </div>
        </div>
    );
};

export default FeaturedProducts;
