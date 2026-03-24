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

// Interfaces for type safety
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

  // State for search and filtering
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // State for dialogs and modals
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IssueEditDetails | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // State for table selection and filters
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>("ALL");
  const [selectedModel, setSelectedModel] = useState<string>("");

  // State for loading indicators
  const [publishingIds, setPublishingIds] = useState<number[]>([]);
  const [modelUpdatingIds, setModelUpdatingIds] = useState<number[]>([]);

  // User authentication and permissions
  const {
    userInfo,
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType,
  } = userAuth();

  const Permission = userInfo?.permissions?.find(p => p.parent_id === 'settings' && p.children_id === 'issue');

  // Fetch issues data
  const { data: issuesResponse, isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: fetchIssues
  });

  // Fetch products data
  const { data: productResponse } = useQuery({
    queryKey: ["product"],
    queryFn: fetchProductAll
  });

  // Fetch categories data
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

  // Compute model tabs based on selected device
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

  // Mutations for CRUD operations
  const { mutateAsync: IssueCategory } = useMutation({ mutationFn: createIssue });
  const { mutateAsync: updateProduct } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Issues }) =>
      updateIssues(id, payload),
  });
  const { mutateAsync: deleteIssue } = useMutation({ mutationFn: deleteIssues });

  const issues = issuesResponse?.data || [];

  // Map for quick lookup of rows by ID
  const detailRowById = useMemo(() => {
    return new Map<number, any>(issues.map((row: any) => [Number(row.id), row]));
  }, [issues]);

  // Table columns definition
  const columns = [
    {id: 'name', label: 'Name', sortable: true, align: 'left'},
    {id: "categories_name", label: "Device Type", sortable: true, align: 'left'},
    {id: 'product_name', label: 'Model Type', sortable: true, align: 'left'},
    {id: 'is_publish', label: 'Publish', sortable: false, align: 'left' },
    {id: 'created_at', label: '', sortable: false, align: 'right'}
  ];

  // Function to open edit modal and fetch issue details
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

  // Handle delete button click
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

    const selectedRow = displayRows.find((row: any) => row.id === selectedRowId);
    const idsToDelete =
      selectedRow?.detail_ids && selectedRow.detail_ids.length
        ? selectedRow.detail_ids
        : [selectedRowId];

    setDeleteIds(idsToDelete);
    setDialogTitle("Confirm Delete");
    setDialogOpen(true);
    setDialogMessage("Are you sure you want to delete this issue? Once deleted, all connected Job Order will also be removed.");
  };

  // Handle update button click
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

  // Confirm delete operation
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

  // Handle adding a new issue
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

  // Handle updating an existing issue
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
      setModalOpen(false);
    }
  };

  // Handle row click for selection
  const handleRowClick = (row: any) => {
    setSelectedRowId(row.id);
  };

  // Handle row double click for edit
  const handleRowDoubleClick = (row: any) => {
    if (!Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit issue.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    }

    void openEditModal(row.name, row.id, undefined, row.categories_id);
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue), 1000);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Filter issues based on search, device, and model
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
  }, [issues, selectedDevice, selectedModel, debouncedSearch]);

  // Compute display rows for the table, grouping by issue key
  const displayRows = useMemo(() => {
    if (selectedDevice !== "ALL") {
      return filteredProduct.map((row: any) => {
        const issueKey = `${row?.name ?? ""}||${row?.categories_id ?? row?.categories_name ?? ""}`;
        return {
          ...row,
          issue_key: issueKey,
          product_items: [
            {
              name: row?.product_name,
              is_publish: row?.is_publish,
              detail_id: Number(row?.id),
              product_id: row?.product_id,
              is_selected: true,
            },
          ],
        };
      });
    }

    const groupedMap = new Map<
      string,
      {
        id: number;
        name: string;
        categories_name: string;
        categories_id?: number | string;
        created_at: string;
        detail_ids: number[];
        issue_key: string;
        product_items: Array<{
          name: string;
          is_publish: number | boolean;
          detail_id: number;
          product_id?: number | string;
          is_selected: boolean;
        }>;
        product_item_map: Map<string, { is_publish: number; detail_id: number; product_id?: number | string }>;
      }
    >();

    filteredProduct.forEach((row: any) => {
      const key = `${row?.name ?? ""}||${row?.categories_id ?? row?.categories_name ?? ""}`;
      const productName = String(row?.product_name ?? "");
      const isPublish = Number(row?.is_publish) === 1 ? 1 : 0;
      const detailId = Number(row?.id);

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: detailId,
          name: row.name,
          categories_name: row.categories_name,
          categories_id: row.categories_id,
          created_at: row.created_at,
          detail_ids: [detailId],
          issue_key: key,
          product_items: [
            {
              name: productName,
              is_publish: isPublish,
              detail_id: detailId,
              product_id: row?.product_id,
              is_selected: true,
            },
          ],
          product_item_map: new Map([
            [productName, { is_publish: isPublish, detail_id: detailId, product_id: row?.product_id }],
          ]),
        });
        return;
      }

      const group = groupedMap.get(key);
      if (!group) return;

      group.detail_ids.push(detailId);

      const existingEntry = group.product_item_map.get(productName);
      if (existingEntry) {
        const mergedPublish = existingEntry.is_publish || isPublish ? 1 : 0;
        group.product_item_map.set(productName, {
          is_publish: mergedPublish,
          detail_id: existingEntry.detail_id,
          product_id: existingEntry.product_id,
        });
        const index = group.product_items.findIndex((item) => item.name === productName);
        if (index >= 0) {
          group.product_items[index].is_publish = mergedPublish;
        }
      } else {
        group.product_item_map.set(productName, {
          is_publish: isPublish,
          detail_id: detailId,
          product_id: row?.product_id,
        });
        group.product_items.push({
          name: productName,
          is_publish: isPublish,
          detail_id: detailId,
          product_id: row?.product_id,
          is_selected: true,
        });
      }

      if (row.created_at && group.created_at) {
        const current = new Date(group.created_at).getTime();
        const next = new Date(row.created_at).getTime();
        if (next > current) {
          group.created_at = row.created_at;
        }
      }
    });

    return Array.from(groupedMap.values()).map((group) => {
      const categoryId = Number(group.categories_id);
      const categoryName = group.categories_name;
      const allCategoryProducts = products.filter((p: any) => {
        if (!p) return false;
        if (!Number.isNaN(categoryId) && Number(p?.categories_id) === categoryId) return true;
        return p?.category_name === categoryName;
      });

      const productIdToItem = new Map<number, typeof group.product_items[number]>();
      group.product_items.forEach((item) => {
        const pid = Number(item.product_id);
        if (!Number.isNaN(pid)) {
          productIdToItem.set(pid, item);
        }
      });

        const mergedProducts = allCategoryProducts.map((product: any) => {
          const pid = Number(product?.id ?? product?.product_id);
          const existing = productIdToItem.get(pid);
          return {
            name: product?.product_name ?? existing?.name ?? '',
            is_publish: existing?.is_publish ?? 0,
            detail_id: existing?.detail_id ?? null,
            product_id: pid,
            is_selected: !!existing,
          };
        });

      return {
        id: group.id,
        name: group.name,
        categories_name: group.categories_name,
        categories_id: group.categories_id,
        issue_key: group.issue_key,
        product_name: mergedProducts,
        publish_list: mergedProducts,
        created_at: group.created_at,
        detail_ids: group.detail_ids,
        __isGrouped: true,
      };
    });
  }, [filteredProduct, selectedDevice, products]);

  // Enable/disable buttons based on selection
  const isUpdateEnabled = !!selectedRowId;
  const isDeleteEnabled = !!selectedRowId;

  // Handle publish toggle for issues
  const handleTogglePublish = async (detailId: number, nextPublish: boolean) => {
    if (isLoading) {
      setSnackBarMessage("Data is loading, please wait.");
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

    const row = detailRowById.get(Number(detailId));
    if (!row) {
      setSnackBarMessage("Unable to find issue details.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return;
    } else {
      // Validate category and product data
      const categoryId =
        row?.categories_id ??
        categoryResponse.find((c: any) => c.label === row?.categories_name)?.value;

      const productIds = Array.isArray(row?.product_id)
        ? row.product_id.map((id: number | string) => Number(id))
        : [Number(row?.product_id)];

      if (!categoryId || productIds.length === 0 || productIds.some((id) => Number.isNaN(id))) {
        setSnackBarMessage("Unable to update publish status. Missing product or category data.");
        setSnackBarType("error");
        setSnackBarOpen(true);
        return;
      }

      setPublishingIds((prev) => [...prev, Number(detailId)]);
      try {
        const issueKey = `${row?.name ?? ""}||${row?.categories_id ?? row?.categories_name ?? ""}`;
        const issueGroup = displayRows.find((item: any) => item.issue_key === issueKey);
        const publishItems = Array.isArray(issueGroup?.publish_list)
          ? issueGroup.publish_list
          : [];
        const modelItems = Array.isArray(issueGroup?.product_name)
          ? issueGroup.product_name
          : [];

        const publishIds = publishItems
          .filter((item: any) => {
            const pid = Number(item?.product_id);
            if (Number.isNaN(pid)) return false;
            if (Number(pid) === Number(row?.product_id)) {
              return nextPublish;
            }
            return Number(item?.is_publish) === 1;
          })
          .map((item: any) => String(item.product_id));

        const allProductIds = modelItems
          .filter((item: any) => item?.is_selected !== false)
          .map((item: any) => Number(item?.product_id))
          .filter((id: number) => !Number.isNaN(id));

        const payload = {
          name: row.name,
          product_id: allProductIds.length
            ? allProductIds
            : productIds.filter((id) => !Number.isNaN(id)),
          categories_id: Number(categoryId),
          possible_solutions: row.possible_solutions ?? '',
          is_publish: publishIds,
          user_id: String(userInfo?.id),
          detail_ids: [],
        };

        console.log('Updating publish status with payload:', payload);

        await updateProduct({ id: Number(detailId), payload });
        setSnackBarMessage("Publish status updated.");
        setSnackBarType("success");
        setSnackBarOpen(true);
        queryClient.invalidateQueries({ queryKey: ["issues"] });
      } catch (error) {
        const message = error?.response?.data?.message?.replace(/^Error:\s*/, '');
        setSnackBarMessage(message || "Failed to update publish status");
        setSnackBarType("error");
        setSnackBarOpen(true);
      } finally {
        setPublishingIds((prev) => prev.filter((id) => id !== Number(detailId)));
      }
    }
  };

  // Handle model toggle for issues
  const handleToggleModel = async (
    baseDetailId: number,
    modelDetailId: number | null,
    productId: number,
    issueKey: string,
    nextChecked: boolean,
  ): Promise<number | null> => {
    if (!Permission?.actions.includes('edit')) {
      setSnackBarMessage("You do not have permission to edit issue.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return null;
    }

    if (!issueKey) {
      setSnackBarMessage("Unable to update model. Missing issue data.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return null;
    }

    const issueRows = displayRows.find((row: any) => row.issue_key === issueKey);
    const productItems = Array.isArray(issueRows?.product_name)
      ? issueRows.product_name
      : [
          {
            name: issueRows?.product_name,
            product_id: issueRows?.product_id,
            detail_id: issueRows?.id,
            is_publish: issueRows?.is_publish,
          },
        ];
    const publishItems = Array.isArray(issueRows?.publish_list)
      ? issueRows.publish_list
      : [];

    const currentProductIds = productItems
      .filter((item: any) => item?.is_selected !== false)
      .map((item: any) => Number(item?.product_id))
      .filter((id: number) => !Number.isNaN(id));

    let nextProductIds = currentProductIds;
    if (nextChecked) {
      nextProductIds = Array.from(new Set([...currentProductIds, Number(productId)]));
    } else {
      nextProductIds = currentProductIds.filter((id) => id !== Number(productId));
    }

    if (nextProductIds.length === 0) {
      setSnackBarMessage("At least one model is required for an issue.");
      setSnackBarType("warning");
      setSnackBarOpen(true);
      return null;
    }

    const row = detailRowById.get(Number(baseDetailId));
    if (!row) {
      setSnackBarMessage("Unable to find issue details.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return null;
    }

    const categoryId =
      row?.categories_id ??
      categoryResponse.find((c: any) => c.label === row?.categories_name)?.value;

    if (!categoryId) {
      setSnackBarMessage("Unable to update model. Missing category data.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return null;
    }

    if (!nextChecked && !modelDetailId) {
      setSnackBarMessage("Unable to remove model. Missing detail reference.");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return null;
    }

    const detailIdsToRemove = nextChecked ? [] : [Number(modelDetailId)];
    const publishIds = publishItems
      .filter((item: any) => {
        const pid = Number(item?.product_id);
        if (Number.isNaN(pid)) return false;
        if (Number(pid) === Number(productId)) {
          return nextChecked ? Number(item?.is_publish) === 1 : false;
        }
        return Number(item?.is_publish) === 1;
      })
      .map((item: any) => String(item.product_id));
    let createdDetailId: number | null = modelDetailId;

    setModelUpdatingIds((prev) => [...prev, Number(baseDetailId)]);
    try {
      const payload = {
        name: row.name,
        product_id: nextProductIds,
        categories_id: Number(categoryId),
        possible_solutions: row.possible_solutions ?? '',
        is_publish: publishIds,
        user_id: String(userInfo?.id),
        detail_ids: detailIdsToRemove,
      };

      await updateProduct({ id: Number(baseDetailId), payload });
      setSnackBarMessage("Model updated successfully.");
      setSnackBarType("success");
      setSnackBarOpen(true);
      queryClient.invalidateQueries({ queryKey: ["issues"] });

      if (nextChecked && !modelDetailId) {
        const refreshed = await fetchIssues();
        const refreshedRows = refreshed?.data ?? refreshed ?? [];
        const match = refreshedRows.find(
          (item: any) =>
            String(item?.name) === String(row?.name) &&
            Number(item?.product_id) === Number(productId) &&
            Number(item?.categories_id) === Number(categoryId),
        );
        createdDetailId = match ? Number(match.id) : null;
      }
    } catch (error) {
      const message = error?.response?.data?.message?.replace(/^Error:\s*/, '');
      setSnackBarMessage(message || "Failed to update model");
      setSnackBarType("error");
      setSnackBarOpen(true);
      return null;
    } finally {
      setModelUpdatingIds((prev) => prev.filter((id) => id !== Number(baseDetailId)));
    }

    return createdDetailId;
  };

  return (
    <div className='p-4 sm:p-6 space-y-6 sm:space-y-10 bg-white'>
      {/* Modal for adding/editing issues */}
      {modalOpen && (
        <IssuesModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          selectedProduct={selectedProduct}
          onSave={isEditMode ? handleUpdateIssue : handleAddIssue}
          isEditMode={isEditMode}
        />
      )}

      {/* Confirmation dialog for delete */}
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

        {/* Search and Add Button Section */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full'>
          {/* Search Field */}
          <div className="w-full sm:w-auto sm:flex-grow sm:max-w-xs">
            <CustomSearchField
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder='Search issues...'
              className="w-full"
            />
          </div>

          {/* Add Button */}
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
        rows={displayRows}
        columns={columns}
        isLoading={isLoading}
        selectedRowId={selectedRowId}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        filterOptionsDevices={deviceTabs}
        filterOptionsModels={modelTabs}
        selectedDeviceFilter={selectedDevice}
        selectedModelFilter={selectedModel}
        publishingIds={publishingIds}
        onTogglePublish={handleTogglePublish}
        modelUpdatingIds={modelUpdatingIds}
        onToggleModel={handleToggleModel}
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