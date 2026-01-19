import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import TableDefault from "../../../components/DataDisplay/TableDefault";
import { useState, useEffect, useMemo } from "react";
import { Package, Plus } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { 
  deleteIssues, 
  fetchIssues, 
  updateIssues,
  createIssue,
  fetchProducts,
  fetchCategory,
  Issues
} from '../../../services/Technician/issuesServices';
import WorkIcon from '@mui/icons-material/Work'; 
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician";
import AlertDialog from "../../../components/feedback/AlertDialog";
import { userAuth } from "../../../hooks/userAuth";
import CustomSearchField from "../../../components/Fields/CustomSearchField";
import IssuesModal from './components/IssuesModal';

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

  const { 
    userInfo,
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
    snackBarMessage ,
    snackBarOpen,
    snackBarType
  } = userAuth();

   const Permission = userInfo?.permissions?.find(p => p.parent_id === 'settings' && p.children_id === 'issue');

  const { data: issuesResponse, isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: fetchIssues
  }); 

  const { mutateAsync: IssueCategory } = useMutation({ mutationFn: createIssue });
  const { mutateAsync: updateProduct } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Issues }) =>
      updateIssues(id, payload),
  });
  const { mutateAsync: deleteIssue } = useMutation({ mutationFn: deleteIssues });

  const issues = issuesResponse?.data || [];

  const columns = [
    {id: 'name', label: 'Name', sortable: true, align: 'left'},
    {id: 'category_name', label: 'Device Type', sortable: false, align: 'left'}, 
    {id: 'created_at', label: '', sortable: false, align: 'right'}
  ];

  const handleDelete = (ids: number[]) => {
    if (Permission?.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete issue.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    }
    setDeleteIds(ids);
    setDialogTitle("Confirm Delete");
    setDialogOpen(true);
    setDialogMessage(`Are you sure you want to delete ${ids.length} issues?`);
  };

  const handleEdit = (pid : string | number) => { 
    if (Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit issue.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    } 
    const issue = issues.find((c: any) => c.pid === pid || c.id === pid);
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

    const response = await deleteIssue(deleteIds);
    if (response?.success) {
      setDialogOpen(false);
      setSnackBarMessage("Issues deleted successfully");
      setSnackBarType("success");
      setSnackBarOpen(true);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    }
  };

  const handleAddIssue = async (formDataIssue: Record<string, string>) => {
    const response = await IssueCategory({
      name: formDataIssue.name,
      /* products_id: Number(formDataIssue.products_id), */
      categories_id: Number(formDataIssue.categories_id)
    });
    if (response?.success) {
      setSnackBarMessage("Issue created successfully");
      setSnackBarType('success');
      setSnackBarOpen(true);
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    }
  };

  const handleUpdateIssue = async (formDataIssue: Record<string, string>) => {
    const payload = {
      id: selectedProduct.id,
      name: formDataIssue.name,
     /*  products_id: Number(formDataIssue.products_id), */
      categories_id: Number(formDataIssue.categories_id)
    };

    const response = await updateProduct({ id: selectedProduct.id, payload });
    if (response) {
      setSnackBarMessage("Issue updated successfully");
      setSnackBarType("success");
      setSnackBarOpen(true);
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      setModalOpen(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue), 1000);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const filteredProduct = useMemo(() => {
    if (!debouncedSearch?.trim()) return issues;
    return issues.filter((c: any) => 
      c.category_name.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      c.name.toLowerCase().includes(debouncedSearch?.toLowerCase())
    );
  }, [issues, debouncedSearch]);

  return (
    <div className='p-4 sm:p-6 space-y-6 sm:space-y-10 bg-white min-h-screen'>
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
        </div>
      </div>

      {/* Table Section */}
      <TableDefault 
        rows={filteredProduct}
        columns={columns}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Issue;