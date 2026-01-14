import React, { useState, useMemo, useEffect } from "react";
import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import TableDefault from "../../../components/DataDisplay/TableDefault";
import { MessageCircleQuestionMark, Plus } from 'lucide-react';
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
import WorkIcon from '@mui/icons-material/Work';
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
  const [modalOpen, setModalOpen] = useState(false);

  const { 
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType, 
    snackBarMessage, 
    snackBarOpen, 
    snackBarType 
  } = userAuth();

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

    // Always ensure "Others" is included
    if (!mapped.find(p => p.value === 'others')) {
      mapped.push({ value: 'others', label: 'Others', categories_id: null });
    }

    return mapped;
  }, [productResponse]);

  const faqs = faqsResponse?.data || [];

  const columns = [
    { id: "title", label: 'Title', sortable: true, align: 'left' }, 
    { id: "device", label: 'Device', sortable: false, align: 'left' },
    { id: "category", label: 'Category', sortable: false, align: 'left' },
    { id: 'created_at', label: '', sortable: false, align: 'right' }
  ];

  // Delete FAQ
  const handleConfirmDelete = async () => {
    try {
      const response = await deleteFaqs(deleteIds);
      if (response?.success) {
        setDialogOpen(false);
        setDialogMessage('');
        setDialogTitle("");
        setSnackBarMessage("Faqs deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);
        queryClient.invalidateQueries({ queryKey: ['faqs'] });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to delete faqs";
      setDialogOpen(false)
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

      const response = await createFaqs(formDataFaqs);

      if (response?.success) {
        setSnackBarMessage("Faqs created successfully");
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

      const response = await updateFaqs(selectedFaqs.id, payload);
      if (response?.success) {
        setSnackBarMessage("Faqs updated successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);
        queryClient.invalidateQueries({ queryKey: ["faqs"] });
        setModalOpen(false);
      }
    } catch (error) {
      throw error;
    }
  };

  // Edit FAQ
  const handleEdit = (pid: string | number) => {
    const faq = faqs.find((c: any) => c.pid === pid || c.id === pid);
    if (!faq) return;
    setSelectedFaqs(faq); 
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = (ids: number[]) => {
    setDeleteIds(ids);
    setDialogTitle("Confirm Delete");
    setDialogOpen(true);
    setDialogMessage(`Are you sure you want to delete ${ids.length} faqs?`);
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

  if (isLoading) return <SpinningRingLoader />;

  return (
    <div className="p-6 space-y-10 bg-white">
      <SnackbarTechnician 
        open={snackBarOpen} 
        type={snackBarType} 
        message={snackBarMessage} 
        onClose={() => setSnackBarOpen(false)} 
      />
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
        title={isEditMode ? "Edit Faqs" : "Add New Faqs"}
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
            // For Add mode, no value selected -> show placeholder
            // For Edit mode, use product ID, fallback to 'others' if undefined
            value: isEditMode 
              ? (selectedFaqs?.products_id ? selectedFaqs.products_id.toString() : 'others')
              : "", 
            options: productOptions,
            validator: v => !v ? 'Product is required' : undefined 
          }
        ]}

        onSubmit={isEditMode ? handleUpdateFaqs : handleAddFaqs}
      />

      <div className='grid md:grid-cols-2'>
        <div className="flex items-center">
          <Breadcrumb 
            items={[
              { label: "Job Order", href: "/beesee/job-order", icon: <WorkIcon /> },
              { label: "Faqs", isActive: true, icon: <MessageCircleQuestionMark /> }
            ]} 
          />
        </div>
        <div className='md:flex items-center justify-end md:space-x-4 space-y-2 mt-2 md:mt-0 md:space-y-0'>
          <CustomSearchField 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
          />
          <button 
            onClick={() => {
              setIsEditMode(false);
              setSelectedFaqs(null);
              setModalOpen(true);
            }} 
            className='flex items-center gap-2 px-5 py-3 bg-yellow-400 rounded-lg font-semibold'>
            <Plus /> Add Faqs
          </button>
        </div>
      </div>

      <TableDefault 
        rows={filteredFaqs} 
        columns={columns} 
        isLoading={isLoading} 
        handleDelete={handleDelete}
        handleEdit={handleEdit}
      />
    </div>
  );
};

export default Faqs;
