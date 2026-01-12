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
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
    snackBarMessage ,
    snackBarOpen,
    snackBarType
  } = userAuth();

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
    setDeleteIds(ids);
    setDialogTitle("Confirm Delete");
    setDialogOpen(true);
    setDialogMessage(`Are you sure you want to delete ${ids.length} issues?`);
  };

  const handleEdit = (pid : string | number) => { 
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
    <div className='p-6 space-y-10'>
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

      <div className='grid md:grid-cols-2'>
        <div className="flex items-center">
          <Breadcrumb 
            items={[
              { label: "Job Order", href: "/beesee/job-order", icon: <WorkIcon className="w-4 h-4"/> }, 
              { label: "Issue Type", isActive: true, icon: <Package /> },
            ]}
          />
        </div>
        <div className='md:flex items-center justify-end md:space-x-4 space-y-2 mt-2 md:mt-0 md:space-y-0'>
          <CustomSearchField 
            value={searchValue} 
            onChange={(e) => setSearchValue(e.target.value)} 
            placeholder='Search...' 
          />
          <button 
            onClick={() => {setModalOpen(true), setIsEditMode(false)}} 
            className='flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md'>
            <Plus /> Add Issue Type
          </button>
        </div>
      </div>

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
