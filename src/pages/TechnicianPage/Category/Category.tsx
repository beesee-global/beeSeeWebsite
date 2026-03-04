import { useState, useMemo, useEffect } from 'react';
import Breadcrumb from '../../../components/Navigation/Breadcrumbs';
import CategoryIcon from '@mui/icons-material/Category';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories, createCategories, deleteCategories, updateCategories } from '../../../services/Technician/categoryServices';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { userAuth } from '../../../hooks/userAuth';
import TableDefault from '../../../components/DataDisplay/TableDefault';
import ReusableTextFieldModal from '../../../components/feedback/ReusableTextFieldModal';
import SnackbarTechnician from '../../../components/feedback/SnackbarTechnician';
import AlertDialog from '../../../components/feedback/AlertDialog';
import CustomSearchField from '../../../components/Fields/CustomSearchField';
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens';

const Category = () => {
    const [searchValue, setSearchValue] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>('');
    const [dialogTitle, setDialogTitle] = useState<string>('');
    const [deleteIds, setDeleteIds] = useState<number[]>([]);

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { userInfo, setSnackBarMessage, setSnackBarOpen, setSnackBarType, } = userAuth();

    const Permission = userInfo?.permissions?.find((p) => p.parent_id === 'settings' && p.children_id === 'issue');

    const { data: categoryResponse, isLoading } = useQuery({
        queryKey: ['category'],
        queryFn: fetchCategories,
    });

    // Extract data array from response
    // Adjust based on your API response structure
    const categories = categoryResponse?.data || []; // If API returns { data: [...] }

    const { mutateAsync: Category, isPending } = useMutation({
        mutationFn: createCategories,
    });

    const { mutateAsync: deleteCategory } = useMutation({
        mutationFn: deleteCategories,
    });

    const { mutateAsync: updateCategory } = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: any }) => updateCategories(id, payload),
    });

    const queryClient = useQueryClient();

    // Custom columns
    const customColumns = [
        { id: 'name', label: 'Name', sortable: true, align: 'left' },
        { id: 'created_at', label: '', sortable: false, align: 'right' },
    ];

    // Handle Delete Button Click
    const handleDeleteClick = () => {
        if (!selectedRowId) {
            setSnackBarMessage('Please select an device first');
            setSnackBarType('warning');
            setSnackBarOpen(true);
            return;
        }

        if (!Permission?.actions.includes('delete')) {
            setSnackBarMessage('You do not have permission to delete device.');
            setSnackBarType('error');
            setSnackBarOpen(true);
            return;
        }

        setDeleteIds([selectedRowId]);
        setDialogTitle('Confirm Delete');
        setDialogOpen(true);
        setDialogMessage('Are you sure you want to delete this device? Once deleted, all connected Job Order will also be removed.');
    };

    // Delete Device
    const handleConfirmDelete = async () => {
        try {
            const formData = new FormData();
            formData.append("ids", JSON.stringify(deleteIds)); 
            formData.append("user_id", String(userInfo?.id)); 
            const response = await deleteCategory(formData); // call mutation

            if (response?.success) {
                setDialogOpen(false);
                setDialogMessage('');
                setDialogTitle('');
                setSnackBarMessage('Device deleted successfully');
                setSnackBarType('success');
                setSnackBarOpen(true);

                // Refetch categories
                queryClient.invalidateQueries({ queryKey: ['category'] });
            }
        } catch (error) {
            setSnackBarMessage('Failed to delete category. Please try again.');
            setSnackBarType('error');
            setSnackBarOpen(true);
        }
    };

    // Handle Update Button Click
    const handleUpdate = () => {
        if (!selectedRowId) {
            setSnackBarMessage('Please select an device first');
            setSnackBarType('warning');
            setSnackBarOpen(true);
            return;
        }

        if (!Permission?.actions.includes('edit')) {
            setSnackBarMessage('You do not have permission to edit device.');
            setSnackBarType('error');
            setSnackBarOpen(true);
            return;
        }

        const category = categories.find((f: any) => f.id === selectedRowId);
        if (!category) return;

        setSelectedCategory(category);
        setIsEditMode(true);
        setModalOpen(true);
    };

    const handleAddCategory = async (formDataCategory: Record<string, string>) => {
        try {
            const formData = new FormData();
            formData.append('name', formDataCategory.name);
            formData.append('is_active', formDataCategory.is_active);
            formData.append('user_id', String(userInfo?.id)); // Include user_id in the payload
            const response = await Category(formData);

            if (response?.success) {
                setSnackBarMessage('Device type created successfully');
                setSnackBarType('success');
                setSnackBarOpen(true);

                // Refetch categories
                queryClient.invalidateQueries({ queryKey: ['category'] });
            }
        } catch (error) {
            setSnackBarMessage('Failed to submit, Please try again.');
            setSnackBarType('error');
            setSnackBarOpen(true);
        }
    };

    const handleUpdateCategory = async (formDataCategory: Record<string, string>) => {
        try {
            const payload = {
                name: formDataCategory.name,
                is_active: formDataCategory.is_active, 
                user_id: userInfo?.id // Include user_id in the payload
            };

            const response = await updateCategory({
                id: selectedCategory.id,
                payload,
            });

            if (response?.success) {
                setSnackBarMessage('Device type updated successfully');
                setSnackBarType('success');
                setSnackBarOpen(true);

                queryClient.invalidateQueries({ queryKey: ['category'] });
                setModalOpen(false);
            }
        } catch (error) {
            setSnackBarMessage('Failed to update category');
            setSnackBarType('error');
            setSnackBarOpen(true);
        }
    };

    // Handle Row Click (Select)
    const handleRowClick = (row: any) => {
        setSelectedRowId(row.id);
    };

    // Handle Row Double Click (Edit)
    const handleRowDoubleClick = (row: any) => {
        if (!Permission?.actions.includes('edit')) {
            setSnackBarMessage('You do not have permission to edit FAQs.');
            setSnackBarType('error');
            setSnackBarOpen(true);
            return;
        }

        const category = categories.find((f: any) => f.id === row.id);
        if (!category) return;

        setSelectedCategory(category);
        setIsEditMode(true);
        setModalOpen(true);
    };

    // --- update debounce after 3 seconds ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchValue]);

    // --- Memoized filtered categories ---
    const filteredCategory = useMemo(() => {
        if (!debouncedSearch.trim()) return categories;
        return categories.filter((c: any) => c.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    }, [categories, debouncedSearch]);

    // Check if buttons should be enabled
    const isUpdateEnabled = !!selectedRowId;
    const isDeleteEnabled = !!selectedRowId;

    if (isLoading) return <SpinningRingLoader />;

    return (
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-10 bg-white">
            
            {/* Dialog */}
            <AlertDialog open={dialogOpen} title={dialogTitle} message={dialogMessage} onClose={() => setDialogOpen(false)} onSubmit={handleConfirmDelete} />

            <ReusableTextFieldModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditMode ? 'Edit Device Type' : 'Add New Device Type'}
                fields={[
                    {
                        name: 'name',
                        placeholder: 'Device Type Name',
                        maxLength: 100,
                        type: 'text',
                        multiline: false,
                        rows: 1,
                        value: isEditMode ? selectedCategory?.name || '' : '',
                        validator: (value) => (!value.trim() ? 'Name is required' : undefined),
                    },
                    {
                        name: 'is_active',
                        placeholder: "Don't have an model type",
                        type: 'checkbox',
                        value: isEditMode
                            ? (selectedCategory?.is_active === true ||
                               selectedCategory?.is_active === 'true' ||
                               selectedCategory?.is_active === 1 ||
                               selectedCategory?.is_active === '1'
                                  ? 'true'
                                  : 'false')
                            : 'false',
                    },
                ]}
                onSubmit={isEditMode ? handleUpdateCategory : handleAddCategory}
            />

            {/* Header Section - Responsive layout */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
                {/* Breadcrumb Section */}
                <div className="flex items-center w-full">
                    <Breadcrumb items={[{ label: 'Device Type', isActive: true, icon: <CategoryIcon /> }]} />
                </div>

                {/* Search and Add Button Section - Search first, then Add button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full">
                    {/* Search Field - Full width on mobile, auto width on larger screens */}
                    <div className="w-full sm:w-auto sm:flex-grow sm:max-w-xs">
                        <CustomSearchField value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search categories..." className="w-full" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {/* Add FAQ Button */}
                        {Permission?.actions.includes('add') && (
                            <button
                                onClick={() => {
                                    setIsEditMode(false);
                                    setSelectedCategory(null);
                                    setModalOpen(true);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm"
                            >
                                <Plus size={18} />
                                <span className="whitespace-nowrap">Add</span>
                            </button>
                        )}

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
            </div>

            {/* Table Section */}
            <TableDefault
                rows={filteredCategory}
                columns={customColumns}
                isLoading={isLoading}
                selectedRowId={selectedRowId}
                onRowClick={handleRowClick}
                onRowDoubleClick={handleRowDoubleClick}
                sortable={'name'}
            />
        </div>
    );
};

export default Category;
