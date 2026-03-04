import React, { useState, useMemo, useEffect } from "react";
import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import TableDefault from "../../../components/DataDisplay/TableDefault";
import { MessageCircleQuestionMark, Plus, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  fetchFaqsAll, 
  deleteFaqs, 
  fetchAllDevices, 
  fetchAllProducts,
  createFaqs,
  updateFaqs
} from '../../../services/Technician/faqsServices';
import FaqsDialog from "./components/FaqsDialog";
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician";
import AlertDialog from "../../../components/feedback/AlertDialog";
import { userAuth } from "../../../hooks/userAuth";
import CustomSearchField from "../../../components/Fields/CustomSearchField";
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'

const Faqs = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFaqs, setSelectedFaqs] = useState<any>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { 
    userInfo,
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,  
  } = userAuth();

  const Permission = userInfo?.permissions?.find(p => p.parent_id === 'faqs' && p.children_id === '');
 
  // Fetch FAQs
  const { data: faqsResponse, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: fetchFaqsAll
  });

  // Fetch categories
  const { data: categoryResponse = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchAllDevices,
    select: (res) => res.data.map((item: any) => ({
      value: item.id.toString(),
      label: item.name
    }))
  });

  // Fetch products and add "Others"
  const { data: productResponse = [] } = useQuery({
    queryKey: ['products'],
    queryFn: fetchAllProducts,
  });

  const productOptions = useMemo(() => {
    const mapped = (productResponse?.data || []).map((item: any) => ({
      value: item.id.toString(),
      label: item.product_name,
      categories_id: item.categories_id,
    })); 
    return mapped;
  }, [productResponse]);

  const faqs = faqsResponse?.data || [];
  const selectedFaq = faqs.find((f: any) => f.id === selectedRowId);

  const columns = [
    { id: "title", label: 'Title', sortable: true, align: 'left' }, 
    { id: "device", label: 'Device', sortable: false, align: 'left' },
    { id: "category", label: 'Category', sortable: false, align: 'left' },
    { id: 'created_at', label: '', sortable: false, align: 'right' }
  ];

  // Handle Row Click (Select)
  const handleRowClick = (row: any) => {
    setSelectedRowId(row.id);
  };

  // Handle Row Double Click (Edit)
  const handleRowDoubleClick = (row: any) => {
    if (!Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit FAQs.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }
    
    const faq = faqs.find((f: any) => f.id === row.id);
    if (!faq) return;
    
    setSelectedFaqs(faq);
    setIsEditMode(true);
    setModalOpen(true);
  };

  // Handle Update Button Click
  const handleUpdate = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select an FAQ first");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }

    if (!Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit FAQs.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }

    const faq = faqs.find((f: any) => f.id === selectedRowId);
    if (!faq) return;
    
    setSelectedFaqs(faq);
    setIsEditMode(true);
    setModalOpen(true);
  };

  // Handle Delete Button Click
  const handleDeleteClick = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select an FAQ first");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }

    if (!Permission?.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete FAQs.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }

    setDeleteIds([selectedRowId]);
    setDialogTitle("Confirm Delete");
    setDialogOpen(true);
    setDialogMessage("Are you sure you want to delete this FAQ?");
  };

  // Delete FAQ
  const handleConfirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("ids", JSON.stringify(deleteIds)); 
      formData.append("user_id", String(userInfo?.id));   

      const response = await deleteFaqs(formData);
      if (response?.success) {
        setDialogOpen(false);
        setDialogMessage('');
        setDialogTitle("");
        setSelectedRowId(null);
        setSnackBarMessage("FAQ deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);
        queryClient.invalidateQueries({ queryKey: ['faqs'] });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to delete FAQ";
      setDialogOpen(false);
      setSnackBarMessage(message);
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  };

  // Add FAQ
  const handleAddFaqs = async (formData: Record<string, string>) => { 
    try {
      const formDataFaqs = new FormData();
      formDataFaqs.append('title', formData.title);
      formDataFaqs.append('explanation', formData.explanation);
      formDataFaqs.append('products_id', formData.product);
      formDataFaqs.append('categories_id', formData.category);
      formDataFaqs.append('is_all_devices', formData.is_all_devices ?? false);
      formDataFaqs.append('user_id', userInfo?.id.toString() || '');

      const response = await createFaqs(formDataFaqs);

      if (response?.success) {
        setSnackBarMessage("FAQ created successfully");
        setSnackBarType('success');
        setSnackBarOpen(true);
        queryClient.invalidateQueries({ queryKey: ['faqs'] });
      }
    } catch (error) {
      setSnackBarMessage("Failed to submit, Please try again.");
      setSnackBarType('error');
      setSnackBarOpen(true);
    }
  };

  // Update FAQ
  const handleUpdateFaqs = async (formData: Record<string, string>) => {
    try { 
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('explanation', formData.explanation);
      payload.append('products_id', formData.product);
      payload.append('categories_id', formData.category);
      payload.append('is_all_devices', formData.is_all_devices ?? '0');
      payload.append('user_id', userInfo?.id.toString() || '');

      const response = await updateFaqs(selectedFaqs.id, payload);
      if (response?.success) {
        setSnackBarMessage("FAQ updated successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);
        queryClient.invalidateQueries({ queryKey: ["faqs"] });
        setModalOpen(false);
      }
    } catch (error) {
      setSnackBarMessage("Failed to update FAQ. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  };

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue), 1000);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const filteredFaqs = useMemo(() => {
    if (!debouncedSearch.trim()) return faqs;
    return faqs.filter((c: any) => c.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [faqs, debouncedSearch]);

  // Check if buttons should be enabled
  const isUpdateEnabled = !!selectedRowId;
  const isDeleteEnabled = !!selectedRowId;

  if (isLoading) return <SpinningRingLoader />;

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-10 bg-white min-h-screen"> 
      <AlertDialog 
        open={dialogOpen} 
        title={dialogTitle}
        message={dialogMessage} 
        onClose={() => setDialogOpen(false)} 
        onSubmit={handleConfirmDelete} 
      />
      <FaqsDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditMode ? "Edit FAQ" : "Add New FAQ"}
        fields={[
          { 
            name: 'title', 
            placeholder: 'Title', 
            type: 'text', 
            value: isEditMode ? selectedFaqs?.title : "", 
            validator: v => !v.trim() ? 'Title is required' : undefined 
          },
          { 
            name: 'explanation', 
            placeholder: 'Explanation', 
            type: 'text', 
            value: isEditMode ? selectedFaqs?.explanation : "", 
            multiline: true, 
            rows: 3, 
            validator: v => !v.trim() ? 'Explanation is required' : undefined 
          },
          { 
            name: 'category', 
            placeholder: 'Select category', 
            type: 'select', 
            value: isEditMode ? selectedFaqs?.categories_id?.toString() : "", 
            options: categoryResponse, 
            validator: v => !v ? 'Category is required' : undefined 
          },
          { 
            name: 'product', 
            placeholder: 'Select product', 
            type: 'select',
            value: isEditMode 
              ? (selectedFaqs?.products_id ? selectedFaqs.products_id.toString() : '')
              : "", 
            options: productOptions,
            validator: v => !v ? 'Product is required' : undefined 
          }
        ]}
        onSubmit={isEditMode ? handleUpdateFaqs : handleAddFaqs}
      />

      {/* Header Section - Responsive layout */}
      <div className='flex flex-col lg:grid lg:grid-cols-2 gap-4'>
        {/* Breadcrumb Section */}
        <div className="flex items-center w-full">
          <Breadcrumb 
            items={[
              { label: "FAQs", isActive: true, icon: <MessageCircleQuestionMark /> }
            ]} 
          />
        </div>
        
        {/* Search and Action Buttons Section */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full'>
          {/* Search Field - Full width on mobile, auto width on larger screens */}
          <div className="w-full sm:w-auto sm:flex-grow sm:max-w-xs">
            <CustomSearchField 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Add FAQ Button */}
            {Permission?.actions.includes('add') && (
              <button 
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedFaqs(null);
                  setModalOpen(true);
                }} 
                className='flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm'
              >
                <Plus size={18} /> 
                <span className="whitespace-nowrap">Add FAQ</span>
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
        rows={filteredFaqs} 
        columns={columns} 
        isLoading={isLoading}
        selectedRowId={selectedRowId}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
      />
    </div>
  );
};

export default Faqs;
