import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import TableCustomizableHeaders from "./components/TableCustomizableHeadersIssue";
import { useState, useEffect, useMemo } from "react";
import { Package, Plus, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { 
  deleteIssues, 
  fetchIssues, 
  updateIssues,
  createIssue,
  fetchProductAll, 
  Issues
} from '../../../services/Technician/issuesServices';  
import AlertDialog from "../../../components/feedback/AlertDialog";
import { userAuth } from "../../../hooks/userAuth";
import CustomSearchField from "../../../components/Fields/CustomSearchField";
import IssuesModal from './components/IssuesModal';
import { fetchCategoriesNoIsActive } from '../../../services/Technician/categoryServices'

const Issue = () => {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null); 
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>("ALL");
  const [selectedModel, setSelectedModel] = useState<string>("");

  const { 
    userInfo,
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType, 
  } = userAuth();

   const Permission = userInfo?.permissions?.find(p => p.parent_id === 'settings' && p.children_id === 'issue');

  const { data: issuesResponse, isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: fetchIssues
  }); 

  const { data: productResponse } = useQuery({
    queryKey: ["product"],
    queryFn: fetchProductAll
  });

  const { data: categoryResponse = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoriesNoIsActive,
    select: (res) => res.data.map((item: any) => ({
      value: item.id,
      label: item.name
    }))
  })

  const products = productResponse?.data ?? [];
  const deviceTabs = ["ALL", ...categoryResponse.map((c: any) => c.label)];

  const modelTabs = useMemo(() => {
    const selectedCategoryId = categoryResponse.find((c: any) => c.label === selectedDevice)?.value;

    const filteredModels = products.filter((p: any) => {
      if (selectedDevice === "ALL") return true;

      return (
        p.category_name === selectedDevice ||
        Number(p.categories_id) === Number(selectedCategoryId)
      );
    });

    return Array.from(new Set(filteredModels.map((p: any) => p.product_name)));
  }, [products, selectedDevice, categoryResponse]);

  const { mutateAsync: IssueCategory } = useMutation({ mutationFn: createIssue });
  const { mutateAsync: updateProduct } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Issues }) =>
      updateIssues(id, payload),
  });
  const { mutateAsync: deleteIssue } = useMutation({ mutationFn: deleteIssues });

  const issues = issuesResponse?.data || [];

  const columns = [
    {id: 'name', label: 'Name', sortable: true, align: 'left'},
    {id: "categories_name", label: "Device Type", sortable: true, align: 'left'},
    {id: 'product_name', label: 'Model Type', sortable: true, align: 'left'}, 
    {id: 'is_publish', label: 'Publish', sortable: false, align: 'left' },
    {id: 'created_at', label: '', sortable: false, align: 'right'}
  ];

  
  // Handle Delete Button Click
  const handleDeleteClick = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select an issue first");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }

    if (!Permission?.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete issue.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }

    setDeleteIds([selectedRowId]);
    setDialogTitle("Confirm Delete");
    setDialogOpen(true);
    setDialogMessage("Are you sure you want to delete this issue? Once deleted, all connected Job Order will also be removed.");
  };

    // Handle Update Button Click
  const handleUpdate = () => {
    if (!selectedRowId) {
      setSnackBarMessage("Please select an issue first");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return;
    }

    if (!Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit issue.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }

    const issue = issues.find((f: any) => f.id === selectedRowId);
    if (!issue) return;
    
    setSelectedProduct(issue);
    setIsEditMode(true);
    setModalOpen(true);
  };
     
  const handleConfirmDelete = async () => {
    if (!deleteIds?.length) {
      setSnackBarMessage("No items selected to delete.");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      setDialogOpen(false);
      return;
    }

    const formData = new FormData();
    formData.append("ids", JSON.stringify(deleteIds)); 
    formData.append("user_id", String(userInfo?.id));  

    const response = await deleteIssue(formData);
    if (response?.success) {
      setDialogOpen(false);
      setSnackBarMessage("Issues deleted successfully");
      setSnackBarType("success");
      setSnackBarOpen(true);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    }
  };

  const handleAddIssue = async (formDataIssue: Record<string, string>) => {
    try { 
      const response = await IssueCategory({
        name: formDataIssue.name,
        product_id: Number(formDataIssue.product_id),
        categories_id: Number(formDataIssue.categories_id),
        possible_solutions: formDataIssue.explanation,
        user_id: String(userInfo?.id),
        is_publish: formDataIssue.publish
      });
      if (response?.success) {
        setSnackBarMessage("Issue created successfully");
        setSnackBarType('success');
        setSnackBarOpen(true);
        setModalOpen(false)
        queryClient.invalidateQueries({ queryKey: ['issues'] });
      }
    } catch (error) {
      const message = error?.response?.data?.message?.replace(/^Error:\s*/, '');
      setSnackBarMessage(message || "Failed to create issue");
      setSnackBarType('error');
      setSnackBarOpen(true);
      setModalOpen(false)
    }
  };

  const handleUpdateIssue = async (formDataIssue: Record<string, string>) => {
    try {
      const payload = {
        id: selectedProduct.id,
        name: formDataIssue.name,
        product_id: Number(formDataIssue.product_id),
        categories_id: Number(formDataIssue.categories_id),
        possible_solutions: formDataIssue.explanation,
        is_publish: formDataIssue.publish,
        user_id: String(userInfo?.id)
      };

      const response = await updateProduct({ id: selectedProduct.id, payload });
      if (response) {
        setSnackBarMessage("Issue updated successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);
        queryClient.invalidateQueries({ queryKey: ["issues"] });
        setModalOpen(false);
      }
    } catch (error) {
      const message = error?.response?.data?.message?.replace(/^Error:\s*/, '');
      setSnackBarMessage(message || "Failed to update issue");
      setSnackBarType("error");
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
      setSnackBarMessage("You do not have permission to edit issue.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }
    
    const issue = issues.find((f: any) => f.id === row.id);
    if (!issue) return;
    
    setSelectedProduct(issue);
    setIsEditMode(true);
    setModalOpen(true);
  };
 

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue), 1000);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const filteredProduct = useMemo(() => {
    let result = issues;

    if (debouncedSearch?.trim()) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter((c: any) =>
        c.product_name.toLowerCase().includes(search) ||
        c.categories_name.toLowerCase().includes(search) ||
        c.name.toLowerCase().includes(search)
      );
    }

    if (selectedDevice !== "ALL") {
      result = result.filter((c: any) => c.categories_name === selectedDevice);
    }

    if (selectedModel) {
      result = result.filter((c: any) => c.product_name === selectedModel);
    }

    return result;
  }, [issues, selectedDevice, selectedModel, debouncedSearch]);

  // Check if buttons should be enabled
  const isUpdateEnabled = !!selectedRowId;
  const isDeleteEnabled = !!selectedRowId;

  return (
    <div className='p-4 sm:p-6 space-y-6 sm:space-y-10 bg-white'>
      {/* Modal */}
      {modalOpen && (
        <IssuesModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          selectedProduct={selectedProduct}
          onSave={isEditMode ? handleUpdateIssue : handleAddIssue}
          isEditMode={isEditMode}
        />
      )} 

      <AlertDialog 
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleConfirmDelete} 
      />

      {/* Header Section - Responsive layout */}
      <div className='flex flex-col lg:grid lg:grid-cols-2 gap-4'>
        {/* Breadcrumb Section */}
        <div className="flex items-center w-full">
          <Breadcrumb 
            items={[
              { label: "Issue Type", isActive: true, icon: <Package /> },
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
              placeholder='Search issues...' 
              className="w-full"
            />
          </div>
          
          {/* Add Button - Full width on mobile, auto width on larger screens */}
          {Permission?.actions.includes('add') && 
            <div className="w-full sm:w-auto">
              <button 
                onClick={() => {setModalOpen(true), setIsEditMode(false)}} 
                className='flex items-center justify-center gap-2 px-4 py-3 w-full sm:w-auto bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm sm:text-base'
              >
                <Plus size={18} className="sm:size-5" /> 
                <span className="whitespace-nowrap">Add Issue Type</span>
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
        filterOptionsDevices={deviceTabs}
        filterOptionsModels={modelTabs}
        selectedDeviceFilter={selectedDevice}
        selectedModelFilter={selectedModel}
        onDeviceFilterChange={(device) => {
          setSelectedDevice(device);
          setSelectedModel("");
        }}
        onModelFilterChange={(model) => setSelectedModel(model)}
      />
    </div>
  );
};

export default Issue;
