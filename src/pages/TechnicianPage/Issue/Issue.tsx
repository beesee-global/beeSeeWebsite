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
  Issues,
  fetchIssueByName
} from '../../../services/Technician/issuesServices';
import AlertDialog from "../../../components/feedback/AlertDialog";
import { userAuth } from "../../../hooks/userAuth";
import CustomSearchField from "../../../components/Fields/CustomSearchField";
import IssuesModal from './components/IssuesModal';
import { fetchCategoriesNoIsActive } from '../../../services/Technician/categoryServices'

interface IssueFormValues {
  id?: string;
  product_id: string[];
  categories_id: string;
  name: string;
  explanation?: string;
  publish?: boolean;
}

interface IssueEditDetails {
  id: number;
  detail_ids?: number[];
  product_id: string[];
  product_detail_pairs?: Array<{
    product_id: string;
    detail_id: number;
  }>;
  categories_id: string;
  name: string;
  possible_solutions?: string;
  is_publish?: boolean | number;
}

const Issue = () => {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IssueEditDetails | null>(null);
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

  const openEditModal = async(issueName: string, issueId: number, selectedDetailId?: number, categories_id?: number) => {
    try {
      const response = await fetchIssueByName(String(issueName), Number(categories_id));
      const issue = response?.data?.result ?? response?.result ?? response;

      if (!issue) {
        setSnackBarMessage("Failed to load issue details.");
        setSnackBarType("error");
        setSnackBarOpen(true);
        return;
      }

      const detailIds = Array.isArray(issue?.id) ? issue.id : [];
      const productIds = Array.isArray(issue?.product_id)
        ? issue.product_id.map((id: number | string) => String(id))
        : [];

      let productDetailPairs: Array<{ product_id: string; detail_id: number }> =
        Array.isArray(issue?.product_id) && Array.isArray(issue?.id)
          ? issue.product_id.map((productId: number | string, index: number) => ({
              product_id: String(productId),
              detail_id: Number(issue.id[index]),
            }))
          : [];

      if (selectedDetailId) {
        const selectedIndex = detailIds.findIndex((id: number) => Number(id) === Number(selectedDetailId));
        if (selectedIndex >= 0) {
          const selectedProductId = productIds[selectedIndex];
          productDetailPairs = selectedProductId
            ? [{ product_id: selectedProductId, detail_id: Number(selectedDetailId) }]
            : [];
        }
      }

      const selectedProductIds = selectedDetailId
        ? productDetailPairs.map((p) => p.product_id)
        : productIds;

      setSelectedProduct({
        id: selectedDetailId ?? issueId,
        detail_ids: selectedDetailId ? [selectedDetailId] : detailIds,
        name: issue.name ?? issueName,
        product_id: selectedProductIds,
        product_detail_pairs: productDetailPairs,
        categories_id: String(issue?.categories_id ?? ''),
        possible_solutions: issue?.possible_solutions ?? '',
        is_publish: issue?.is_publish ?? false,
      });
      setIsEditMode(true);
      setModalOpen(true);
    } catch (error) {
      const message = error?.response?.data?.message?.replace(/^Error:\s*/, '');
      setSnackBarMessage(message || "Failed to load issue details");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  };


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

    void openEditModal(issue.name, issue.id, undefined, issue.categories_id);
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

  const handleAddIssue = async (formDataIssue: IssueFormValues) => {
    try {
      const response = await IssueCategory({
        name: formDataIssue.name,
        product_id: formDataIssue.product_id.map((id) => Number(id)),
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

  const handleUpdateIssue = async (formDataIssue: IssueFormValues) => {
    try {
      const unselectedDetailIds =
        selectedProduct?.product_detail_pairs
          ?.filter(({ product_id }) => !formDataIssue.product_id.includes(product_id))
          .map(({ detail_id }) => detail_id) ?? [];

      const payload = {
        id: selectedProduct?.id,
        name: formDataIssue.name,
        product_id: formDataIssue.product_id.map((id) => Number(id)),
        categories_id: Number(formDataIssue.categories_id),
        possible_solutions: formDataIssue.explanation,
        is_publish: formDataIssue.publish,
        user_id: String(userInfo?.id),
        detail_ids: unselectedDetailIds,
      };

      if (!selectedProduct?.id) {
        setSnackBarMessage("Failed to update issue");
        setSnackBarType("error");
        setSnackBarOpen(true);
        return;
      }

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

    void openEditModal(row.name, row.id, undefined, row.categories_id);
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
      const selectedCategoryId = categoryResponse.find(
        (c: any) => c.label === selectedDevice
      )?.value;
      result = result.filter((c: any) =>
        c.categories_name === selectedDevice ||
        (selectedCategoryId != null &&
          Number(c.categories_id) === Number(selectedCategoryId))
      );
    }

    if (selectedModel) {
      result = result.filter((c: any) => c.product_name === selectedModel);
    }

    return result;
  }, [issues, selectedDevice, selectedModel, debouncedSearch, categoryResponse]);

  const groupedRows = useMemo(() => {
    const groups = new Map<string, any>();
    const categoryMap = new Map(
      categoryResponse.map((c: any) => [String(c.value), c.label])
    );

    filteredProduct.forEach((issue: any) => {
      const categoryId = String(issue.categories_id ?? '');
      const categoryLabel =
        categoryMap.get(categoryId) ?? issue.categories_name ?? '';
      const key = `${issue.name ?? ''}__${categoryId}`;

        if (!groups.has(key)) {
          groups.set(key, {
            id: issue.id,
            name: issue.name,
            categories_id: issue.categories_id,
            categories_name: categoryLabel,
            product_name: '',
            models: [],
            publish_by_product_id: {},
            is_publish: null,
            created_at: issue.created_at,
          });
        }
        const group = groups.get(key);
        group.models.push({
          id: issue.id,
          product_id: issue.product_id,
          product_name: issue.product_name,
          is_publish: issue.is_publish,
          name: issue.name,
        });
        group.publish_by_product_id[String(issue.product_id)] =
          Number(issue.is_publish) === 1;
        if (new Date(issue.created_at).getTime() > new Date(group.created_at).getTime()) {
          group.created_at = issue.created_at;
        }
      });

      return Array.from(groups.values()).map((group) => {
        const allModels = products
          .filter((p: any) => Number(p.categories_id) === Number(group.categories_id))
          .map((p: any) => {
            const productId = p.id ?? p.product_id;
            const issueMatch = group.models.find(
              (m: any) => Number(m.product_id) === Number(productId)
            );
            return {
              product_id: productId,
              product_name: p.product_name ?? p.name,
              checked: !!issueMatch,
              issue_id: issueMatch?.id,
              is_publish: group.publish_by_product_id[String(productId)] ? 1 : 0,
            };
          });

        group.all_models = allModels;
        group.product_name = group.models.map((m: any) => m.product_name).join(', ');
        const publishValues = group.models.map((m: any) => Number(m.is_publish) === 1);
        const allPublished = publishValues.length > 0 && publishValues.every(Boolean);
        const allDraft = publishValues.length > 0 && publishValues.every((v: boolean) => !v);
        group.publish_summary = allPublished ? 'All Published' : allDraft ? 'All Draft' : 'Mixed';
        return group;
      });
    }, [filteredProduct, categoryResponse, products]);

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
        rows={groupedRows}
        columns={columns}
        isLoading={isLoading}
        selectedRowId={selectedRowId}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        onModelClick={(issueId: number, issueName: string) => {
          setSelectedRowId(issueId);
          const issue = issues.find((item: any) => item.id === issueId);
          void openEditModal(issueName, issueId, issueId, issue?.categories_id);
        }}
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
