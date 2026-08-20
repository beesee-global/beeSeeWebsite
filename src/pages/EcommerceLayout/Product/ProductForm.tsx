import React, { useEffect, useRef, useState } from "react";
// @ts-ignore: No type declarations available for sortablejs
import Sortable from "sortablejs";
import { useParams } from "react-router-dom";
import { 
  Save,
  Upload,
  Plus,
  X,
  Package,
  Tag,
  Hash,
  Image as ImageIcon,
  Video,
  FileText,
  Settings,
  DollarSign,
  GripVertical,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomTextField from "../../../components/Fields/CustomTextField";
import CustomSelectField from "../../../components/Fields/CustomSelectField";
import RichTextEditor from "../../../components/Fields/RichTextEditor";
import ImageCropAdjustDialog from "../../../components/Fields/ImageCropAdjustDialog";
import CustomIconPicker from "../../../components/Fields/CustomIconPicker";
import PdfPagePreview from "../../../components/Fields/PdfPagePreview";
import AlertDialog from "../../../components/feedback/AlertDialog";
import { LucideIcon } from "../../../utils/lucideIconLoader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createProduct, 
  fetchCategory, 
  fetchSpecificProduct, 
  updateProduct,
  deleteProductVideo,
  deleteProductBrochure,
  deleteProductBrochureItem,
  deleteProductSpecsHighlight,
  updateProductVisibility,
} from '../../../services/Ecommerce/productServices'
import { createCategory } from '../../../services/Ecommerce/categoryServices';
import Snackbar from '../../../components/feedback/Snackbar'; 
import { Switch } from '@mui/material';
import { AlertColor } from '@mui/material/Alert';
import { userAuth } from "../../../hooks/userAuth";
import Product from "../../TechnicianPage/Product/Product";

interface FormProductData {
  product_name: string;
  tagline: string;
  description: string;
  details: string;
  category: string;
  quantity: string;
}

interface FormError {
  product_name?: string;
  tagline?: string;
  description?: string;
  details?: string;
  category?: string;
  quantity?: string;
  gallery?: string;
  video?: string;
  brochure?: string;
  specsHighlight?: string;
  quickHighlights?: string;
  specs?: string;
}

type SummaryIssue = {
  message: string;
  targetId: string;
  focusId?: string;
  animationTargetId?: string;
};

type GalleryItem = 
  | { image_id: number; image_url: string }  // existing DB image
  | File                                     // new uploaded image
  | null;                                    // empty slot

type BrochureRecord = {
  id: number | null;
  brochure_url: string;
  original_filename: string;
  display_order?: number;
  legacy?: boolean;
};

type PendingDelete =
  | { type: "gallery"; index: number; message: string }
  | { type: "video-new"; message: string }
  | { type: "video-existing"; message: string }
  | { type: "brochure-existing"; brochure: BrochureRecord; message: string }
  | { type: "brochure-new"; index: number; message: string }
  | { type: "spec-highlight-new"; message: string }
  | { type: "spec-highlight-existing"; message: string }
  | { type: "spec-category"; catIndex: number; message: string }
  | { type: "spec-field"; catIndex: number; fieldIndex: number; message: string };

type MediaPreviewModal = {
  type: "brochure" | "specification" | "gallery";
  url: string;
} | null;

const QUICK_HIGHLIGHT_FIELDS = [
  {
    key: "Cloud Storage",
    icon: "HardDrive",
    placeholder: "e.g., 100GB included",
  },
  {
    key: "Size",
    icon: "Ruler",
    placeholder: "e.g., 86 inches",
  },
  {
    key: "Resolution",
    icon: "Monitor",
    placeholder: "e.g., 4K UHD",
  },
  {
    key: "Panel Type",
    icon: "PanelsTopLeft",
    placeholder: "e.g., LED backlit LCD",
  },
] as const;

const createQuickHighlightSpecs = () =>
  QUICK_HIGHLIGHT_FIELDS.map(({ key, icon }) => ({
    specs_key: key,
    specs_value: "",
    icon,
  }));

const normalizeSavedHoverSpecs = (value: unknown) => {
  let parsed = value;

  // MySQL JSON_ARRAYAGG can be returned as a JSON string by the API driver.
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item: any) => ({
        key: String(item.key ?? item.specs_key ?? ""),
        value: String(item.value ?? item.specs_value ?? ""),
        icon: item.icon ? String(item.icon) : undefined,
      }));
  }

  // Accept the object shape used by the multipart update payload as well.
  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed as Record<string, unknown>).map(([key, item]) => ({
      key,
      value: String(
        item && typeof item === "object"
          ? (item as any).value ?? (item as any).specs_value ?? ""
          : item ?? ""
      ),
      icon: item && typeof item === "object" && (item as any).icon
        ? String((item as any).icon)
        : undefined,
    }));
  }

  return [];
};

const FILE_UPLOAD_WINDOW_MS = 60_000;
const MAX_FILE_UPLOADS_PER_MINUTE = 10;
const MAX_VIDEO_UPLOADS_PER_MINUTE = 2;
const PRODUCT_UPLOAD_FIELD_CLASS = "flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#FCD000] bg-[#FFF9E6] p-5 text-center transition-colors hover:border-[#D4A900] hover:bg-[#FFF3C4] dark:border-[#B8860B] dark:bg-amber-950/20 dark:hover:border-[#FCD000] dark:hover:bg-amber-950/30";
const PRODUCT_UPLOAD_ICON_CLASS = "text-[#B7791F] dark:text-[#FCD000]";
const PRODUCT_UPLOAD_META_CLASS = "text-[#7A5A00] dark:text-amber-200";

type ProductVisibilitySection =
  | "basicInformation"
  | "details"
  | "gallery"
  | "quickProductHighlight"
  | "specifications"
  | "video"
  | "brochure"
  | "specsHighlight";

const PRODUCT_VISIBILITY_FIELDS: Record<ProductVisibilitySection, string> = {
  basicInformation: "basic_information_enabled",
  details: "details_enabled",
  gallery: "gallery_enabled",
  quickProductHighlight: "quick_product_highlight_enabled",
  specifications: "specifications_enabled",
  video: "video_enabled",
  brochure: "brochure_enabled",
  specsHighlight: "product_specs_highlight_enabled",
};

const PRODUCT_VISIBILITY_LABELS: Record<ProductVisibilitySection, string> = {
  basicInformation: "Basic information",
  details: "Details",
  gallery: "Product gallery",
  quickProductHighlight: "Quick product highlights",
  specifications: "Product specifications",
  video: "Product video",
  brochure: "Product brochure",
  specsHighlight: "Specification highlight image",
};

const isVisibilityEnabled = (value: unknown) =>
  value !== false && value !== 0 && value !== "0";

const getYouTubeEmbedUrl = (value?: string) => {
  if (!value || typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const videoId = host === "youtu.be"
      ? url.pathname.split("/").filter(Boolean)[0]
      : host === "youtube.com" || host === "m.youtube.com"
        ? url.pathname.startsWith("/embed/")
          ? url.pathname.split("/")[2]
          : url.searchParams.get("v") || undefined
        : undefined;

    return videoId && /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
};

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType,
    snackBarMessage,
    snackBarType,
    snackBarOpen
  } = userAuth();

  // --- Basic Info ---
  const [formProductData, setProductData] = useState<FormProductData>({
    product_name: "",
    tagline: "",
    description: "",
    details: "",
    category: "",
    quantity: "0"
  });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCategoryCreationPending, setIsCategoryCreationPending] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryCreationError, setCategoryCreationError] = useState("");

  useEffect(() => {
    if (!isCreatingCategory) return;

    const handleCategoryModalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCategoryCreationPending) {
        setIsCreatingCategory(false);
        setNewCategoryName("");
        setCategoryCreationError("");
      }
    };

    document.addEventListener("keydown", handleCategoryModalKeyDown);
    return () => document.removeEventListener("keydown", handleCategoryModalKeyDown);
  }, [isCreatingCategory, isCategoryCreationPending]);

  // Keep four easy-to-complete highlights, while allowing each product to name them.
  const [hoverSpecs, setHoverSpecs] = useState<{
    specs_key: string;
    specs_value: string;
    icon?: string;
  }[]>(createQuickHighlightSpecs);
  const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null);
  const quickHighlightsRef = useRef<HTMLDivElement | null>(null);
  const userValidationActiveRef = useRef(false);
  const markValidationInteraction = () => {
    userValidationActiveRef.current = true;
  };

  const handleHoverSpecChange = (
    index: number,
    field: "specs_key" | "specs_value" | "icon",
    value: string
  ) => {
    markValidationInteraction();
    const updated = [...hoverSpecs];
    updated[index][field] = value;
    setHoverSpecs(updated);
    setFormError((prev) => ({ ...prev, quickHighlights: undefined }));
  };

  // FlyonUI's drag-and-drop examples use SortableJS. Force its fallback mode so
  // Chrome never creates the large, rotated native drag preview.
  useEffect(() => {
    const container = quickHighlightsRef.current;
    if (!container) return;

    const sortable = Sortable.create(container, {
      animation: 0,
      draggable: ".quick-highlight-card",
      handle: ".quick-highlight-drag-handle",
      forceFallback: true,
      fallbackOnBody: true,
      fallbackTolerance: 3,
      ghostClass: "quick-highlight-ghost",
      chosenClass: "quick-highlight-chosen",
      dragClass: "quick-highlight-dragging",
      fallbackClass: "quick-highlight-fallback",
      onEnd: ({ oldIndex, newIndex }: { oldIndex: number | null; newIndex: number | null }) => {
        if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;

        markValidationInteraction();
        setHoverSpecs((previous) => {
          const reordered = [...previous];
          const [movedHighlight] = reordered.splice(oldIndex, 1);
          reordered.splice(newIndex, 0, movedHighlight);
          return reordered;
        });
        setFormError((previous) => ({ ...previous, quickHighlights: undefined }));
      },
    });

    return () => sortable.destroy();
  }, []);

  // Price increment/decrement helpers
  const increaseQuantity = () => {
    setProductData((prev) => ({
      ...prev,
      quantity: String(Math.max(0, parseFloat(prev.quantity || '0') + 1))
    }));
  };

  const decreaseQuantity = () => {
    setProductData((prev) => ({
      ...prev,
      quantity: String(Math.max(0, parseFloat(prev.quantity || '0') - 1))
    }));
  };

  // --- Form Error ---
  const [formError, setFormError] = useState<FormError>({})
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [hydrationVersion, setHydrationVersion] = useState(0);
  const previousSummaryIssueSignatureRef = useRef<string | null>(null);
  const previousValidationAttemptRef = useRef(0);
  const previousHydrationVersionRef = useRef(0);
  const [expandedSummarySections, setExpandedSummarySections] = useState<Record<string, boolean>>({});

  // --- Gallery Logic --- 
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [isGalleryUploadOpen, setIsGalleryUploadOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<{ index: number; file: File } | null>(null);
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<File[]>([]);
  const [productVideo, setProductVideo] = useState<File | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState("");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [videoSource, setVideoSource] = useState<"upload" | "youtube">("upload");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isRemovingExistingVideo, setIsRemovingExistingVideo] = useState(false);
  const [productBrochures, setProductBrochures] = useState<File[]>([]);
  const [existingBrochures, setExistingBrochures] = useState<BrochureRecord[]>([]);
  const [brochurePreviewUrls, setBrochurePreviewUrls] = useState<string[]>([]);
  const [productSpecsHighlight, setProductSpecsHighlight] = useState<File | null>(null);
  const [existingProductSpecsHighlightUrl, setExistingProductSpecsHighlightUrl] = useState("");
  const [productSpecsHighlightPreviewUrl, setProductSpecsHighlightPreviewUrl] = useState("");
  const [mediaPreviewModal, setMediaPreviewModal] = useState<MediaPreviewModal>(null);
  const [isRemovingProductSpecsHighlight, setIsRemovingProductSpecsHighlight] = useState(false);
  const [isRemovingExistingBrochure, setIsRemovingExistingBrochure] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [brochureEnabled, setBrochureEnabled] = useState(true);
  const [productSpecsHighlightEnabled, setProductSpecsHighlightEnabled] = useState(true);
  const [basicInformationEnabled, setBasicInformationEnabled] = useState(true);
  const [detailsEnabled, setDetailsEnabled] = useState(true);
  const [galleryEnabled, setGalleryEnabled] = useState(true);
  const [quickProductHighlightEnabled, setQuickProductHighlightEnabled] = useState(true);
  const [specificationsEnabled, setSpecificationsEnabled] = useState(true);
  const [visibilityUpdating, setVisibilityUpdating] = useState<ProductVisibilitySection | null>(null);
  const fileUploadAttempts = useRef<number[]>([]);
  const videoUploadAttempts = useRef<number[]>([]);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeUrl);

  const registerFileUpload = (type: "image" | "video" | "brochure") => {
    const now = Date.now();
    fileUploadAttempts.current = fileUploadAttempts.current.filter((time) => now - time < FILE_UPLOAD_WINDOW_MS);
    videoUploadAttempts.current = videoUploadAttempts.current.filter((time) => now - time < FILE_UPLOAD_WINDOW_MS);

    if (fileUploadAttempts.current.length >= MAX_FILE_UPLOADS_PER_MINUTE) {
      const message = "File upload limit reached. Please wait one minute before trying again.";
      setFormError((prev) => ({ ...prev, [type === "image" ? "gallery" : type]: message }));
      setSnackBarType("error");
      setSnackBarMessage(message);
      setSnackBarOpen(true);
      return false;
    }

    if (type === "video" && videoUploadAttempts.current.length >= MAX_VIDEO_UPLOADS_PER_MINUTE) {
      const message = "You can select up to 2 videos per minute. Please wait before trying again.";
      setFormError((prev) => ({ ...prev, video: message }));
      setSnackBarType("error");
      setSnackBarMessage(message);
      setSnackBarOpen(true);
      return false;
    }

    fileUploadAttempts.current.push(now);
    if (type === "video") videoUploadAttempts.current.push(now);
    return true;
  };

  useEffect(() => {
    if (!productVideo) {
      setVideoPreviewUrl(existingVideoUrl);
      return;
    }

    const previewUrl = URL.createObjectURL(productVideo);
    setVideoPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [existingVideoUrl, productVideo]);

  useEffect(() => {
    const previewUrls = productBrochures.map((file) => URL.createObjectURL(file));
    setBrochurePreviewUrls(previewUrls);
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [productBrochures]);

  useEffect(() => {
    if (!productSpecsHighlight) {
      setProductSpecsHighlightPreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(productSpecsHighlight);
    setProductSpecsHighlightPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [productSpecsHighlight]);

  const handleVideoChange = (file: File | null) => {
    if (!file) return;
    markValidationInteraction();

    if (!file.type.startsWith("video/")) {
      setFormError((prev) => ({ ...prev, video: "Please select a video file." }));
      return;
    }
    if (!registerFileUpload("video")) return;

    setProductVideo(file);
    setFormError((prev) => ({ ...prev, video: undefined }));
  };

  const handleBrochureChange = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    markValidationInteraction();
    const files = Array.from(fileList);
    if (existingBrochures.length + productBrochures.length + files.length > 10) {
      setFormError((prev) => ({ ...prev, brochure: "A product can have up to 10 brochures." }));
      return;
    }
    const invalidFile = files.find((file) => file.type !== "application/pdf" || !/\.pdf$/i.test(file.name));
    if (invalidFile) {
      setFormError((prev) => ({ ...prev, brochure: "Please select PDF brochures only." }));
      return;
    }
    const oversizedFile = files.find((file) => file.size > 20 * 1024 * 1024);
    if (oversizedFile) {
      setFormError((prev) => ({ ...prev, brochure: "Each brochure must be 20 MB or smaller." }));
      return;
    }
    for (const file of files) {
      if (!registerFileUpload("brochure")) return;
    }

    setProductBrochures((previous) => [...previous, ...files]);
    setFormError((prev) => ({ ...prev, brochure: undefined }));
  };

  const handleProductSpecsHighlightChange = (file: File | null) => {
    if (!file) return;
    markValidationInteraction();
    if (!file.type.startsWith("image/")) {
      setFormError((prev) => ({ ...prev, specsHighlight: "Please select an image file." }));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setFormError((prev) => ({ ...prev, specsHighlight: "The specification image must be 20 MB or smaller." }));
      return;
    }
    if (!registerFileUpload("image")) return;
    setProductSpecsHighlight(file);
    setFormError((prev) => ({ ...prev, specsHighlight: undefined }));
  };

  const setVisibilityState = (section: ProductVisibilitySection, enabled: boolean) => {
    if (section === "details") setDetailsEnabled(enabled);
    else if (section === "video") setVideoEnabled(enabled);
    else if (section === "brochure") setBrochureEnabled(enabled);
    else if (section === "specsHighlight") setProductSpecsHighlightEnabled(enabled);
    else if (section === "basicInformation") setBasicInformationEnabled(enabled);
    else if (section === "gallery") setGalleryEnabled(enabled);
    else if (section === "quickProductHighlight") setQuickProductHighlightEnabled(enabled);
    else setSpecificationsEnabled(enabled);
  };

  const handleVisibilityChange = async (section: ProductVisibilitySection, enabled: boolean) => {
    const productDatabaseId = productInfo?.id;
    if (!productDatabaseId || visibilityUpdating) {
      setVisibilityState(section, enabled);
      if (!visibilityUpdating) {
        setSnackBarType("info");
        const label = PRODUCT_VISIBILITY_LABELS[section];
        setSnackBarMessage(`${label} will be ${enabled ? "enabled" : "disabled"} when this product is saved.`);
        setSnackBarOpen(true);
      }
      return;
    }

    const field = PRODUCT_VISIBILITY_FIELDS[section];
    setVisibilityUpdating(section);
    try {
      await updateProductVisibility(productDatabaseId, { [field]: enabled });
      setVisibilityState(section, enabled);
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      setSnackBarType("success");
      const label = PRODUCT_VISIBILITY_LABELS[section];
      setSnackBarMessage(`${label} ${enabled ? "enabled" : "disabled"}.`);
      setSnackBarOpen(true);
    } catch (error: any) {
      setSnackBarType("error");
      setSnackBarMessage(error.response?.data?.message || `Unable to update ${section} visibility.`);
      setSnackBarOpen(true);
    } finally {
      setVisibilityUpdating(null);
    }
  };

  const renderVisibilityToggle = (
    section: ProductVisibilitySection,
    enabled: boolean,
    ariaLabel: string
  ) => (
    <div className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-xl border border-gray-200 bg-white pl-4 pr-2 text-base font-bold text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
      <span className={`h-3 w-3 rounded-full ${enabled ? "bg-emerald-500" : "bg-red-500"}`} />
      {enabled ? "Active" : "Inactive"}
      <Switch
        checked={enabled}
        onChange={(_, checked) => handleVisibilityChange(section, checked)}
        disabled={visibilityUpdating === section}
        inputProps={{ "aria-label": ariaLabel }}
        sx={{ transform: "scale(1.25)", "& .MuiSwitch-switchBase.Mui-checked": { color: "#10b981" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#10b981" } }}
      />
    </div>
  );

  const applyEditedImage = (file: File) => {
    if (!imageToEdit) return;
    markValidationInteraction();
    const nextGalleryIndex = imageToEdit.index + 1;
    setGallery((current) => {
      const next = [...current];
      next[imageToEdit.index] = file;
      return next;
    });
    setFormError((prev) => ({ ...prev, gallery: undefined }));

    const [nextFile, ...remainingFiles] = pendingGalleryFiles;
    setPendingGalleryFiles(remainingFiles);
    setImageToEdit(nextFile ? { index: nextGalleryIndex, file: nextFile } : null);
  };

  const handleNewGalleryFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    markValidationInteraction();

    const selectedFiles = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    const acceptedFiles = selectedFiles.filter(() => registerFileUpload("image"));

    if (!acceptedFiles.length) {
      setFormError((prev) => ({ ...prev, gallery: "Please select one or more valid image files." }));
      return;
    }

    const [firstFile, ...remainingFiles] = acceptedFiles;
    setPendingGalleryFiles(remainingFiles);
    setImageToEdit({ index: gallery.length, file: firstFile });
    setIsGalleryUploadOpen(false);
  };

  const cancelGalleryImageEdit = () => {
    if (!imageToEdit) return;

    const [nextFile, ...remainingFiles] = pendingGalleryFiles;
    setPendingGalleryFiles(remainingFiles);
    setImageToEdit(nextFile ? { index: imageToEdit.index, file: nextFile } : null);
  };

  const handleAddImage = () => {
    markValidationInteraction();
    setPendingGalleryFiles([]);
    setIsGalleryUploadOpen(true);
  };

  const [removedImages, setRemovedImages] = useState<number[]>([]);

  const handleRemoveImage = (index: number) => {
    markValidationInteraction();
    const removedItem = gallery[index];
    
    // If it's an existing DB image (not a new File)
    if (removedItem && typeof removedItem === "object" && "image_id" in removedItem) {
      setRemovedImages((prev) => [...prev, removedItem.image_id]);
    }

    // Remove from gallery state
    setGallery(gallery.filter((_, i) => i !== index));
  };
 
  // --- Specifications Logic ---
  const [specs, setSpecs] = useState<
    { title: string; fields: { specs_key: string; specs_value: string }[] }[]
  >([]);

  const handleAddCategory = () => {
    markValidationInteraction();
    setSpecs([...specs, { title: "", fields: [] }]);
  };

  const handleAddField = (catIndex: number) => {
    markValidationInteraction();
    const updated = [...specs];
    updated[catIndex].fields.push({ specs_key: "", specs_value: "" });
    setSpecs(updated);
  };

  const handleRemoveField = (catIndex: number, fieldIndex: number) => {
    markValidationInteraction();
    const updated = [...specs];
    updated[catIndex].fields.splice(fieldIndex, 1);
    setSpecs(updated);
  };

  const handleRemoveCategory = (catIndex: number) => {
    markValidationInteraction();
    const updated = [...specs];
    updated.splice(catIndex, 1);
    setSpecs(updated);
  };

  // --- key and value field ---
  const handleChange = (
    catIndex: number,
    fieldIndex: number,
    fieldName: "specs_key" | "specs_value",
    value: string
  ) => {
    markValidationInteraction();
    const updated = [...specs];
    updated[catIndex].fields[fieldIndex][fieldName] = value;
    setSpecs(updated);
    // clear specs error when user edits any spec field
    setFormError((prev) => ({ ...prev, specs: undefined }));
  };

  // --- Category title ---
  const handleTitleChange = (catIndex: number, value: string) => {
    markValidationInteraction();
    const updated = [...specs];
    updated[catIndex].title = value;
    setSpecs(updated);
    // clear specs error when user edits a category title
    setFormError((prev) => ({ ...prev, specs: undefined }));
  };
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    markValidationInteraction();
    const { name, value } = e.target;

    if (name === "category" && value === "__create_new_category__") {
      setIsCreatingCategory(true);
      setNewCategoryName("");
      setCategoryCreationError("");
      return;
    }

    setProductData((prev: FormProductData) => ({
      ...prev,
      [name] : value
    }));

    // clear error when typing
    setFormError((prev) => ({
      ...prev,
      [name] : undefined
    }))
  }

  // --- Validation Function ---
  const validateForm = (): FormError => {
    const errors: FormError = {};

    // Use safe string casts to avoid runtime .trim() errors when values are undefined/null
    const productName = String(formProductData.product_name || '');
    const tagline = String(formProductData.tagline || '');
    const description = String(formProductData.description || '');
    const categoryVal = formProductData.category;

    if (!productName.trim()) errors.product_name = "Product name is required.";
    if (!tagline.trim()) errors.tagline = "Tagline is required.";
    if (!description.trim()) errors.description = "Description is required.";
    if (!categoryVal) errors.category = "Category is required.";
    // Quantity is intentionally optional while its form field is hidden.
    // Keep the existing state and payload support for future reactivation.
    
    if (!gallery.some((item) => item !== null)) errors.gallery = "Please upload at least one image."
    if (videoSource === "youtube" && !getYouTubeEmbedUrl(youtubeUrl)) {
      errors.video = "Enter a valid YouTube video link.";
    }

    if (specs.length === 0) {
      errors.specs = "Please add at least one specification category.";
    } else {
      for (let i = 0; i < specs.length; i++) {
        const cat = specs[i];

        // 🔸 Category title validation (safe cast)
        const catTitle = String(cat.title || '');
        if (!catTitle.trim()) {
          errors.specs = `Category ${i + 1} title cannot be empty.`;
          break; // stop checking further
        }

        // 🔸 Must have at least one field
        if (!Array.isArray(cat.fields) || cat.fields.length === 0) {
          errors.specs = `Category "${catTitle || `#${i + 1}`}" must have at least one field.`;
          break;
        }

        // 🔸 Validate each field inside category (use safe casts)
        for (let j = 0; j < cat.fields.length; j++) {
          const field = cat.fields[j];
          const key = String(field.specs_key || '');
          const val = String(field.specs_value || '');
          // Empty rows are unused placeholders; partially filled rows remain invalid.
          if (!key.trim() && !val.trim()) continue;
          if (key.trim() === "" || val.trim() === "") {
            errors.specs = `In "${catTitle || `Category ${i + 1}`}", field ${j + 1} has an empty key or value.`;
            break;
          }
        }

        if (errors.specs) break; // stop checking other category once we find an error
      }
    }

    if (hoverSpecs.length !== QUICK_HIGHLIGHT_FIELDS.length) {
      errors.quickHighlights = "Please complete all four quick product highlights.";
    }

    // Validate the four customer-facing product highlights.
    for (let h = 0; h < hoverSpecs.length; h++) {
      const hs = hoverSpecs[h];
      const k = String(hs.specs_key || "").trim();
      const v = String(hs.specs_value || "").trim();
      if (!k || !v) {
        errors.quickHighlights = `Quick highlight ${h + 1} needs both a title and a value.`;
        break;
      }
    }

    return errors
  }

  const queryClient = useQueryClient();

  // ✅ Mutation for creating product
  const {
    mutateAsync: createProductAsync,
    isPending: isCreating,
  } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product'] });
    }
  })
  
  /* updating data */
  const {
    mutateAsync: updateProductAsync,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product'] });
    }
  });

  const removeProductVideoMutation = useMutation({
    mutationFn: deleteProductVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });

  const removeProductBrochureMutation = useMutation({
    mutationFn: deleteProductBrochure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });

  const removeProductSpecsHighlightMutation = useMutation({
    mutationFn: deleteProductSpecsHighlight,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });

  const handleRemoveExistingVideo = async () => {
    const productDatabaseId = productInfo?.id;
    if (!productDatabaseId || !existingVideoUrl || isRemovingExistingVideo) return;

    setIsRemovingExistingVideo(true);
    try {
      await removeProductVideoMutation.mutateAsync(productDatabaseId);
      setExistingVideoUrl("");
      setVideoPreviewUrl("");
      setYoutubeUrl("");
      setVideoSource("upload");
      setSnackBarType("success");
      setSnackBarMessage("Current product video removed.");
      setSnackBarOpen(true);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to remove the current product video.";
      setFormError((prev) => ({ ...prev, video: message }));
      setSnackBarType("error");
      setSnackBarMessage(message);
      setSnackBarOpen(true);
    } finally {
      setIsRemovingExistingVideo(false);
    }
  };

  const handleRemoveExistingBrochure = async () => {
    const productDatabaseId = productInfo?.id;
    if (!productDatabaseId || isRemovingExistingBrochure) return;

    setIsRemovingExistingBrochure(true);
    try {
      await removeProductBrochureMutation.mutateAsync(productDatabaseId);
      setExistingBrochures([]);
      setSnackBarType("success");
      setSnackBarMessage("Current product brochure removed.");
      setSnackBarOpen(true);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to remove the current product brochure.";
      setFormError((prev) => ({ ...prev, brochure: message }));
      setSnackBarType("error");
      setSnackBarMessage(message);
      setSnackBarOpen(true);
    } finally {
      setIsRemovingExistingBrochure(false);
    }
  };

  const handleRemoveExistingProductSpecsHighlight = async () => {
    const productDatabaseId = productInfo?.id;
    if (!productDatabaseId || !existingProductSpecsHighlightUrl || isRemovingProductSpecsHighlight) return;

    setIsRemovingProductSpecsHighlight(true);
    try {
      await removeProductSpecsHighlightMutation.mutateAsync(productDatabaseId);
      setExistingProductSpecsHighlightUrl("");
      setProductSpecsHighlight(null);
      setSnackBarType("success");
      setSnackBarMessage("Current specification highlight image removed.");
      setSnackBarOpen(true);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to remove the current specification highlight image.";
      setFormError((prev) => ({ ...prev, specsHighlight: message }));
      setSnackBarType("error");
      setSnackBarMessage(message);
      setSnackBarOpen(true);
    } finally {
      setIsRemovingProductSpecsHighlight(false);
    }
  };
  

  // --- save function ---
  const handleSubmit = async () => {
    try {
      markValidationInteraction();
      // 1️⃣ Validate form
      const errors = validateForm();
      setFormError(errors);
      if (Object.keys(errors).length > 0) {
        setValidationAttempt((previous) => previous + 1);
        setSnackBarType("error");
        setSnackBarMessage("Please fill in all required fields.");
        setSnackBarOpen(true);
        return;
      }

      // 2️⃣ Create FormData
      const formData = new FormData();
      formData.append("name", formProductData.product_name);
      formData.append("tagline", formProductData.tagline);
      formData.append("description", formProductData.description);
      formData.append("details", formProductData.details);
      formData.append("quantity", formProductData.quantity);
      formData.append("basic_information_enabled", basicInformationEnabled ? "1" : "0");
      formData.append("details_enabled", detailsEnabled ? "1" : "0");
      formData.append("gallery_enabled", galleryEnabled ? "1" : "0");
      formData.append("quick_product_highlight_enabled", quickProductHighlightEnabled ? "1" : "0");
      formData.append("specifications_enabled", specificationsEnabled ? "1" : "0");
      formData.append("video_enabled", videoEnabled ? "1" : "0");
      formData.append("brochure_enabled", brochureEnabled ? "1" : "0");
      formData.append("product_specs_highlight_enabled", productSpecsHighlightEnabled ? "1" : "0");

      // 3️⃣ Append hover specs & detailed specs
      const hoverSpecsObj: Record<string, { value: string; icon?: string }> = {};
      hoverSpecs.forEach((h) => {
        if (h.specs_key && h.specs_value) {
          hoverSpecsObj[h.specs_key] = { value: h.specs_value, icon: h.icon || undefined };
        }
      });
      formData.append("hoverSpecs", JSON.stringify(hoverSpecsObj));

      const detailedSpecsObj: Record<string, Record<string, string>> = {};
      specs.forEach((cat) => {
        const title = cat.title || "";
        detailedSpecsObj[title] = {};
        (cat.fields || []).forEach((f) => {
          if (f.specs_key?.trim() && f.specs_value?.trim()) {
            detailedSpecsObj[title][f.specs_key.trim()] = f.specs_value.trim();
          }
        });
      });
      formData.append("detailedSpecs", JSON.stringify(detailedSpecsObj));

      // 4️⃣ Convert all gallery images (existing + new) to Files
      const galleryFiles: File[] = [];

      const getFileFromUrl = async (url: string, filenameBase: string) => {
        const res = await fetch(url);
        const blob = await res.blob();
        const extensionMimeMap: Record<string, string> = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".webp": "image/webp",
          ".gif": "image/gif",
        };
        const urlExtension = (() => {
          try {
            return `.${new URL(url, window.location.origin).pathname.split(".").pop()?.toLowerCase()}`;
          } catch {
            return "";
          }
        })();
        const mimeType = blob.type.startsWith("image/")
          ? blob.type === "image/jpg" ? "image/jpeg" : blob.type
          : extensionMimeMap[urlExtension];
        const extensionByMime: Record<string, string> = {
          "image/jpeg": ".jpg",
          "image/png": ".png",
          "image/webp": ".webp",
          "image/gif": ".gif",
        };

        if (!mimeType || !extensionByMime[mimeType]) {
          throw new Error(`Existing image has an unsupported media type: ${blob.type || urlExtension || "unknown"}`);
        }

        return new File([blob], `${filenameBase}${extensionByMime[mimeType]}`, { type: mimeType });
      };

      for (const item of gallery) {
        if (item instanceof File) {
          galleryFiles.push(item); // new uploaded file
        } else if (item && typeof item === "object" && "image_url" in item) {
          // existing image from DB → convert to File
          const fileFromUrl = await getFileFromUrl(item.image_url, `image_${item.image_id}`);
          galleryFiles.push(fileFromUrl);
        }
      }

      galleryFiles.forEach((file, idx) => {
        formData.append(`gallery[${idx}]`, file);
      });

      // The API uploads this file to the product's configured S3 storage.
      if (productVideo) {
        formData.append("video_type", "s3");
        formData.append("video", productVideo);
      }
      if (videoSource === "youtube" && youtubeEmbedUrl) {
        formData.append("video_type", "youtube");
        formData.append("video_url", youtubeEmbedUrl);
      }
      productBrochures.forEach((brochure) => {
        formData.append("brochures", brochure);
      });
      if (productSpecsHighlight) {
        formData.append("product_specs_highlight", productSpecsHighlight);
      }

      // 5️⃣ Call mutation
      if (id) {   
        formData.append("category_id", formProductData.category);
        await updateProductAsync({
          id: productInfo.id,
          productData: formData
        });
      } else { 
        formData.append("category_id", String(formProductData.category));
        console.log("📤 Sending FormData:");
        console.log("Category ID:", formProductData.category);
        console.log("Name:", formProductData.product_name);
        console.log("Tagline:", formProductData.tagline);
        console.log("Description:", formProductData.description);
        console.log("Quantity:", formProductData.quantity);
        console.log("Available categories:", category);
        await createProductAsync(formData);
      }

      // 6️⃣ Success feedback
      setSnackBarType("success");
      setSnackBarMessage(id ? "Product updated successfully!" : "Product created successfully!");
      setSnackBarOpen(true);
      if (!id) {
        navigate("/beesee/ecommerce/product");
      }

    } catch (error: any) {
      console.error("❌ Error uploading product:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      // Optional: handle specific API errors
      if (error.response?.status === 400) {
        const message = error.response.data?.message;
        console.error("❌ Backend error message:", message);
        if (message === "Name already exists.") {
          setFormError((prev) => ({ ...prev, product_name: message }));
        }
        if (message === "Tagline already exists.") {
          setFormError((prev) => ({ ...prev, tagline: message }));
        }
      }

      setSnackBarType("error");
      setSnackBarMessage(`Failed to upload product: ${error.response?.data?.message || error.message}`);
      setSnackBarOpen(true);
    }
  };

  // --- fetch all category ---
  const {
    data: category = [],
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['category'],
    queryFn: () => fetchCategory(),
    select: (data) => {
      // map api result into label/value pairs
      const mapped = data.map((item: { id: number; name: string }) => ({
        value: String(item.id),
        label: item.name, // ✅ user-friendly name
      }));

      // add the "Select Category" option at the start
      return [
        { value: "", label: 'Select Category'},
        {
          value: "__create_new_category__",
          label: "Create new category",
          icon: <Plus className="h-4 w-4 text-[#c59b00]" aria-hidden="true" />,
        },
        ...mapped
      ]
    }
  });

  const handleCreateCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setCategoryCreationError("Category name is required.");
      return;
    }

    setCategoryCreationError("");
    setIsCategoryCreationPending(true);
    try {
      await createCategory({ name: trimmedName, icon: "Tag" });
      const refreshedCategories = await refetchCategories();
      const createdCategory = refreshedCategories.data?.find(
        (option) => option.label.trim().toLowerCase() === trimmedName.toLowerCase()
      );

      if (!createdCategory) {
        throw new Error("The category was created but could not be loaded.");
      }

      setProductData((prev) => ({ ...prev, category: createdCategory.value }));
      setFormError((prev) => ({ ...prev, category: undefined }));
      setIsCreatingCategory(false);
      setNewCategoryName("");
      setSnackBarType("success");
      setSnackBarMessage(`Category "${createdCategory.label}" added successfully.`);
      setSnackBarOpen(true);
    } catch (error: any) {
      const responseData = error?.response?.data;
      setCategoryCreationError(
        responseData?.message || responseData?.error || error?.message || "Failed to create category. Please try again."
      );
    } finally {
      setIsCategoryCreationPending(false);
    }
  };

  const handleCloseCategoryModal = () => {
    if (isCategoryCreationPending) return;
    setIsCreatingCategory(false);
    setNewCategoryName("");
    setCategoryCreationError("");
  };

  // --- fetch specific product params id ---
  const { data: productInfo } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchSpecificProduct(id as string),
    enabled: !!id,
  });

  // --- populate form state when productInfo is loaded --- 
  useEffect(() => {
    if (productInfo) {
      const productCategory = String(productInfo.category_id ?? "");
      const matchingCategory = category.find(
        (option) => option.value === productCategory || option.label === productCategory
      );

      setProductData({
        product_name: productInfo?.name || "",
        tagline: productInfo?.tagline || "",
        description: productInfo?.description || "",
        details: productInfo?.details || "",
        category: matchingCategory?.value || "",
        quantity: String(productInfo?.quantity || "0")
      });

      // Gallery
      const initialGallery = (productInfo.images || []).map((img: any, index: number) => ({
        image_id: img.image_id ?? index,
        image_url: img.image_url
      }));
      setGallery(initialGallery);
      const savedVideoUrl = [productInfo.video_url, productInfo.videoUrl, productInfo.product_video, productInfo.video?.video_url, productInfo.video?.url]
        .find((value): value is string => typeof value === "string" && value.length > 0) || "";
      const savedYouTubeUrl = productInfo.video_embed_url || productInfo.videoEmbedUrl || productInfo.video?.embed_url || (getYouTubeEmbedUrl(savedVideoUrl) ? savedVideoUrl : "");
      setVideoSource(savedYouTubeUrl ? "youtube" : "upload");
      setYoutubeUrl(savedYouTubeUrl);
      setExistingVideoUrl(
        savedYouTubeUrl ? "" : savedVideoUrl
      );
      setProductVideo(null);
      setVideoEnabled(productInfo.video_enabled !== false && productInfo.video_enabled !== 0 && productInfo.video_enabled !== "0");
      setProductBrochures([]);
      setBrochureEnabled(productInfo.brochure_enabled !== false && productInfo.brochure_enabled !== 0 && productInfo.brochure_enabled !== "0");
      setProductSpecsHighlightEnabled(productInfo.product_specs_highlight_enabled !== false && productInfo.product_specs_highlight_enabled !== 0 && productInfo.product_specs_highlight_enabled !== "0");
      setBasicInformationEnabled(isVisibilityEnabled(productInfo.basic_information_enabled));
      setDetailsEnabled(isVisibilityEnabled(productInfo.details_enabled));
      setGalleryEnabled(isVisibilityEnabled(productInfo.gallery_enabled));
      setQuickProductHighlightEnabled(isVisibilityEnabled(productInfo.quick_product_highlight_enabled));
      setSpecificationsEnabled(isVisibilityEnabled(productInfo.specifications_enabled));
      const savedBrochures = Array.isArray(productInfo.brochures)
        ? productInfo.brochures
        : [];
      const legacyBrochureUrl = [productInfo.brochure_url, productInfo.brochureUrl, productInfo.product_brochure]
        .find((value): value is string => typeof value === "string" && value.length > 0);
      setExistingBrochures(savedBrochures.length
        ? savedBrochures
        : legacyBrochureUrl
          ? [{ id: null, brochure_url: legacyBrochureUrl, original_filename: `${productInfo.name || "product"}-brochure.pdf`, legacy: true }]
          : []
      );

      // Detailed Specs
      const formattedSpecs = Object.entries(productInfo.detailed_specs || {}).map(
        ([title, fieldsObj]) => ({
          title,
          fields: Object.entries((fieldsObj ?? {}) as Record<string, string>).map(([key, value]) => ({
            specs_key: key,
            specs_value: value
          }))
        })
      );
      setSpecs(formattedSpecs);

      // Map saved hover specs into the four editable highlight slots.
      const savedHoverSpecs = normalizeSavedHoverSpecs(
        productInfo.hover_specs ?? productInfo.hoverSpecs
      );
      setProductSpecsHighlight(null);
      setExistingProductSpecsHighlightUrl(
        [productInfo.product_specs_highlight, productInfo.productSpecsHighlight]
          .find((value): value is string => typeof value === "string" && value.length > 0) || ""
      );
      setHoverSpecs(
        QUICK_HIGHLIGHT_FIELDS.map(({ key, icon }, index) => {
          const saved = savedHoverSpecs[index];

          return {
            specs_key: saved?.key || key,
            specs_value: saved?.value || "",
            icon: saved?.icon || icon,
          };
        })
      );
      setHydrationVersion((previous) => previous + 1);
    }
  // `category` is an options array derived by React Query. Depending on it
  // here can re-run hydration after every state update and create a render loop.
  }, [productInfo]);

  // Calculate form completion percentage
  const hasCompleteHoverSpecs = hoverSpecs.length === QUICK_HIGHLIGHT_FIELDS.length
    && hoverSpecs.every((spec) => spec.specs_key.trim() !== "" && spec.specs_value.trim() !== "");

  const hasCompleteDetailedSpecs = specs.length > 0
    && specs.every((category) => {
      if (!String(category.title || "").trim() || !Array.isArray(category.fields) || category.fields.length === 0) {
        return false;
      }
      const populatedFields = category.fields.filter((field) =>
        String(field.specs_key || "").trim() !== "" || String(field.specs_value || "").trim() !== ""
      );
      return populatedFields.length > 0 && populatedFields.every((field) =>
        String(field.specs_key || "").trim() !== ""
        && String(field.specs_value || "").trim() !== ""
      );
    });

  const isQuickHighlightError = (message?: string) =>
    message?.startsWith("Quick highlight") ||
    message === "Please complete all four quick product highlights.";
  const quickHighlightError = isQuickHighlightError(formError.specs)
    ? formError.specs
    : formError.quickHighlights;
  const specificationError = isQuickHighlightError(formError.specs)
    ? undefined
    : formError.specs;

  const basicInformationComplete = Boolean(
    formProductData.product_name.trim() &&
    formProductData.tagline.trim() &&
    formProductData.description.trim() &&
    formProductData.category
  );
  const uniqueSummaryIssues = (issues: SummaryIssue[]) =>
    issues.filter((issue, index, all) => all.findIndex((candidate) => (
      candidate.message === issue.message && candidate.targetId === issue.targetId
    )) === index);
  const basicInformationErrors: SummaryIssue[] = [
    !formProductData.product_name.trim() && {
      message: "Product name: no text or value.",
      targetId: "basic-information-section",
      focusId: "product-name-input",
    },
    !formProductData.tagline.trim() && {
      message: "Tagline: no text or value.",
      targetId: "basic-information-section",
      focusId: "tagline-input",
    },
    !formProductData.description.trim() && {
      message: "Description: no text or value.",
      targetId: "basic-information-section",
      focusId: "description-input",
    },
    !formProductData.category && {
      message: "Category: no value selected.",
      targetId: "basic-information-section",
      focusId: "category-input",
    },
  ].filter(Boolean) as SummaryIssue[];
  const mediaErrors = uniqueSummaryIssues([
    ...(gallery.filter((item) => item !== null).length === 0
      ? [{ message: "Images: upload at least one image.", targetId: "gallery-section", focusId: "gallery-upload-button" }]
      : []),
    ...(formError.gallery ? [{ message: formError.gallery, targetId: "gallery-section", focusId: "gallery-upload-button" }] : []),
    ...(videoSource === "youtube" && !youtubeEmbedUrl
      ? [{ message: "Enter a valid YouTube video link.", targetId: "product-video-section", focusId: "product-youtube-url" }]
      : []),
    ...(formError.video ? [{ message: formError.video, targetId: "product-video-section", focusId: "product-video-section" }] : []),
    ...(formError.brochure ? [{ message: formError.brochure, targetId: "product-brochure-section", focusId: "product-brochure-section" }] : []),
    ...(formError.specsHighlight ? [{ message: formError.specsHighlight, targetId: "specification-highlight-section", focusId: "specification-highlight-section" }] : []),
  ]);
  const quickHighlightIssues: SummaryIssue[] = [
    ...hoverSpecs.flatMap((highlight, index) => {
      const errors: SummaryIssue[] = [];
      if (!highlight.specs_key.trim()) errors.push({
        message: `Highlight ${index + 1}: title is required.`,
        targetId: "quick-highlights-section",
        focusId: `quick-highlight-title-${index}`,
        animationTargetId: `quick-highlight-card-${index}`,
      });
      if (!highlight.specs_value.trim()) errors.push({
        message: `Highlight ${index + 1}: value is required.`,
        targetId: "quick-highlights-section",
        focusId: `quick-highlight-${index}`,
        animationTargetId: `quick-highlight-card-${index}`,
      });
      return errors;
    }),
    ...(quickHighlightError && !hoverSpecs.some((highlight) => !highlight.specs_key.trim() || !highlight.specs_value.trim())
      ? [{ message: quickHighlightError, targetId: "quick-highlights-section", focusId: "quick-highlights-section" }]
      : []),
  ];
  const quickHighlightErrors = uniqueSummaryIssues(quickHighlightIssues);
  const specificationIssues: SummaryIssue[] = [
    ...(specs.length === 0
      ? [{ message: "Specifications: add at least one category.", targetId: "specifications-section", focusId: "add-specification-category-button" }]
      : []),
    ...specs.flatMap((category, categoryIndex) => {
      const errors: SummaryIssue[] = [];
      const categoryTitle = String(category.title || "").trim();
      if (!categoryTitle) errors.push({
        message: `Category ${categoryIndex + 1}: title is required.`,
        targetId: "specifications-section",
        focusId: `spec-category-${categoryIndex}-title`,
      });
      if (!Array.isArray(category.fields) || category.fields.length === 0) {
        errors.push({
          message: `Category ${categoryIndex + 1}: add at least one field.`,
          targetId: "specifications-section",
          focusId: `spec-category-${categoryIndex}-title`,
        });
      }
      category.fields?.forEach((field, fieldIndex) => {
        const key = String(field.specs_key || "").trim();
        const value = String(field.specs_value || "").trim();
        if (!key && !value) return;
        if (!key || !value) errors.push({
          message: `Category ${categoryIndex + 1}, field ${fieldIndex + 1}: key and value are both required.`,
          targetId: "specifications-section",
          focusId: `spec-category-${categoryIndex}-field-${fieldIndex}-${key ? "value" : "key"}`,
        });
      });
      return errors;
    }),
    ...(specificationError && specs.length === 0
      ? [{ message: specificationError, targetId: "specifications-section", focusId: "add-specification-category-button" }]
      : []),
  ];
  const specificationSummaryErrors = uniqueSummaryIssues(specificationIssues);

  const shakeSummaryIssue = (issue: SummaryIssue) => {
    const focusTarget = issue.focusId ? document.getElementById(issue.focusId) : null;
    const animationTarget = document.getElementById(
      issue.animationTargetId || issue.focusId || issue.targetId
    );
    const shakeTargets = [animationTarget, focusTarget]
      .filter((element, index, elements): element is HTMLElement => (
        element instanceof HTMLElement && elements.indexOf(element) === index
      ));
    shakeTargets.forEach((element) => {
      element.classList.add("shake-error");
      element.classList.remove("error");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          element.classList.add("error");
          window.setTimeout(() => element.classList.remove("error"), 1000);
        });
      });
    });
  };

  const scrollToSummaryIssue = (issue: SummaryIssue) => {
    const target = document.getElementById(issue.targetId);
    const focusTarget = issue.focusId ? document.getElementById(issue.focusId) : null;
    // Field issues must scroll to the exact input. Scrolling the parent section
    // first can leave the invalid specification field off-screen on mobile.
    (focusTarget || target)?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (focusTarget instanceof HTMLElement && "focus" in focusTarget) {
      window.setTimeout(() => focusTarget.focus({ preventScroll: true }), 250);
    }
    shakeSummaryIssue(issue);
  };

  const handleRemoveBrochure = async (brochure: BrochureRecord) => {
    const productDatabaseId = productInfo?.id;
    if (!productDatabaseId || isRemovingExistingBrochure) return;

    setIsRemovingExistingBrochure(true);
    try {
      if (brochure.id) {
        await deleteProductBrochureItem(productDatabaseId, brochure.id);
      } else {
        await removeProductBrochureMutation.mutateAsync(productDatabaseId);
      }
      setExistingBrochures((previous) => previous.filter((item) => item.id !== brochure.id));
      setSnackBarType("success");
      setSnackBarMessage("Product brochure removed.");
      setSnackBarOpen(true);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to remove the product brochure.";
      setFormError((prev) => ({ ...prev, brochure: message }));
      setSnackBarType("error");
      setSnackBarMessage(message);
      setSnackBarOpen(true);
    } finally {
      setIsRemovingExistingBrochure(false);
    }
  };

  const closeDeleteConfirmation = () => {
    if (isDeleteProcessing) return;
    setPendingDelete(null);
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete || isDeleteProcessing) return;

    setIsDeleteProcessing(true);
    try {
      switch (pendingDelete.type) {
        case "gallery":
          handleRemoveImage(pendingDelete.index);
          break;
        case "video-new":
          setProductVideo(null);
          setFormError((previous) => ({ ...previous, video: undefined }));
          break;
        case "video-existing":
          await handleRemoveExistingVideo();
          break;
        case "brochure-existing":
          await handleRemoveBrochure(pendingDelete.brochure);
          break;
        case "brochure-new":
          setProductBrochures((previous) => previous.filter((_, index) => index !== pendingDelete.index));
          break;
        case "spec-highlight-new":
          setProductSpecsHighlight(null);
          setFormError((previous) => ({ ...previous, specsHighlight: undefined }));
          break;
        case "spec-highlight-existing":
          await handleRemoveExistingProductSpecsHighlight();
          break;
        case "spec-category":
          handleRemoveCategory(pendingDelete.catIndex);
          break;
        case "spec-field":
          handleRemoveField(pendingDelete.catIndex, pendingDelete.fieldIndex);
          break;
      }
    } finally {
      setIsDeleteProcessing(false);
      setPendingDelete(null);
    }
  };

  const redirectToMobileProgressIssue = (
    sectionKey: string,
    issues: SummaryIssue[],
    fallbackTargetId: string
  ) => {
    const issue = issues[0] || {
      message: "",
      targetId: fallbackTargetId,
      focusId: fallbackTargetId,
    };
    setExpandedSummarySections((previous) => ({ ...previous, [sectionKey]: true }));
    scrollToSummaryIssue(issue);
  };

  const renderMobileProgressStatus = (
    complete: boolean,
    sectionKey: string,
    issues: SummaryIssue[],
    fallbackTargetId: string
  ) => complete ? (
    <div className="mx-auto mb-1 h-2 w-2 rounded-full bg-green-500" />
  ) : (
    <button
      type="button"
      onClick={() => redirectToMobileProgressIssue(sectionKey, issues, fallbackTargetId)}
      className="mx-auto mb-1 block !h-4 !min-h-4 !w-4 !min-w-4 rounded-full !p-1 transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-[#FCD000] focus:ring-offset-1"
      aria-label={`Go to ${sectionKey} error`}
    >
      <span className="block h-2 w-2 rounded-full bg-red-500" />
    </button>
  );

  const allSummaryIssues = [
    ...basicInformationErrors,
    ...mediaErrors,
    ...quickHighlightErrors,
    ...specificationSummaryErrors,
  ];
  const summaryIssueKey = (issue: SummaryIssue) => (
    `${issue.targetId}|${issue.focusId || ""}|${issue.animationTargetId || ""}|${issue.message}`
  );
  const summaryIssueSignature = allSummaryIssues
    .map(summaryIssueKey)
    .sort()
    .join("||");

  useEffect(() => {
    const previousSignature = previousSummaryIssueSignatureRef.current;
    const previousValidationAttempt = previousValidationAttemptRef.current;
    const previousHydrationVersion = previousHydrationVersionRef.current;
    previousSummaryIssueSignatureRef.current = summaryIssueSignature;
    previousValidationAttemptRef.current = validationAttempt;
    previousHydrationVersionRef.current = hydrationVersion;

    // Initialize silently, then shake newly-invalid fields as soon as their
    // live validation state appears. A submit attempt also replays all issues.
    if (previousSignature === null) return;
    if (hydrationVersion !== previousHydrationVersion) return;
    if (!userValidationActiveRef.current && validationAttempt === 0) return;
    const previousIssueKeys = new Set(
      previousSignature ? previousSignature.split("||") : []
    );
    const replayAllIssues = validationAttempt !== previousValidationAttempt;
    allSummaryIssues
      .filter((issue) => replayAllIssues || !previousIssueKeys.has(summaryIssueKey(issue)))
      .forEach(shakeSummaryIssue);
  }, [summaryIssueSignature, validationAttempt, hydrationVersion]);

  const renderSummarySection = (
    title: string,
    summary: string,
    complete: boolean,
    errors: SummaryIssue[],
    sectionKey: string
  ) => {
    const hasErrors = errors.length > 0;
    const isExpanded = expandedSummarySections[sectionKey] ?? false;

    return (
      <div className="border-b border-gray-200 pb-3 last:border-b-0 dark:border-gray-700">
        <div className="mb-1 flex items-center gap-2">
          <div className={`h-2 w-2 shrink-0 rounded-full ${hasErrors || !complete ? "bg-red-500" : "bg-green-500"}`} />
          <span className="min-w-0 flex-1 text-sm font-bold text-gray-600 dark:text-gray-400">{title}</span>
          {hasErrors && (
            <button
              type="button"
              onClick={() => setExpandedSummarySections((previous) => ({ ...previous, [sectionKey]: !isExpanded }))}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? "Hide" : "Show"} ${title} issues`}
            >
              {errors.length} issue{errors.length !== 1 ? "s" : ""}
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
        {hasErrors ? (
          isExpanded ? (
            <div className="ml-4 mt-2 space-y-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {errors.map((issue) => (
                <button
                  key={`${issue.targetId}-${issue.message}`}
                  type="button"
                  onClick={() => scrollToSummaryIssue(issue)}
                  className="block w-full rounded px-1 text-left underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {issue.message}
                </button>
              ))}
            </div>
          ) : (
            <span className="block pl-4 text-sm text-red-600 dark:text-red-400">Needs attention</span>
          )
        ) : (
          <span className="block pl-4 text-sm text-gray-900 dark:text-white">{summary}</span>
        )}
      </div>
    );
  };

  const calculateCompletion = () => {
    let completed = 0;
    const total = 8; // Includes the required four quick product highlights

    if (formProductData.product_name.trim()) completed++;
    if (formProductData.tagline.trim()) completed++;
    if (formProductData.description.trim()) completed++;
    if (formProductData.category) completed++;
    if (formProductData.quantity) completed++;
    if (gallery.filter(f => f !== null).length > 0) completed++;
    if (hasCompleteDetailedSpecs) completed++;
    if (hasCompleteHoverSpecs) completed++;

    return Math.round((completed / total) * 100);
  };
 
  return (
    <div className="ecommerce-product-form min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
      <div className="ecommerce-product-form__content w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Notification */} 
        <Snackbar 
          open={snackBarOpen}
          type={snackBarType}
          message={snackBarMessage}
          onClose={() => setSnackBarOpen(false)}
        />

        <AlertDialog
          open={Boolean(pendingDelete)}
          title="Confirm removal"
          message={pendingDelete?.message || "Are you sure you want to remove this item?"}
          onClose={closeDeleteConfirmation}
          onSubmit={() => void confirmPendingDelete()}
          isLoading={isDeleteProcessing}
        />

        {isCreatingCategory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-category-modal-title"
              className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                <h2
                  id="create-category-modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  Create new category
                </h2>
                <button
                  type="button"
                  onClick={handleCloseCategoryModal}
                  disabled={isCategoryCreationPending}
                  aria-label="Close create category dialog"
                  className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="p-5">
                <label
                  htmlFor="new-category-name"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Category name
                </label>
                <input
                  id="new-category-name"
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => {
                    setNewCategoryName(event.target.value);
                    setCategoryCreationError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleCreateCategory();
                    }
                  }}
                  placeholder="Enter category name"
                  maxLength={100}
                  autoFocus
                  disabled={isCategoryCreationPending}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#FCD000] focus:ring-2 focus:ring-[#FCD000]/30 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-700"
                />
                {categoryCreationError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                    {categoryCreationError}
                  </p>
                )}
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseCategoryModal}
                    disabled={isCategoryCreationPending}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCreateCategory()}
                    disabled={isCategoryCreationPending || !newCategoryName.trim()}
                    className="rounded-md bg-[#FCD000] px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-[#e8bf00] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCategoryCreationPending ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="ecommerce-product-form__layout grid gap-4 md:gap-8">
          {/* Left Column - Basic Info */}
          <div className="ecommerce-product-form__main space-y-4 md:space-y-8">
            {/* Basic Information */}
            <div id="basic-information-section" className="ecommerce-product-section bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="mb-4 flex items-start justify-between gap-3 md:mb-6">
                <div className="flex min-w-0 items-center">
                  <div className="mr-3 rounded-lg bg-[#FFF3C4] p-2 scale-125 origin-left md:mr-4 md:p-3 dark:bg-[#5C4900]/30">
                    <Package className="h-5 w-5 text-[#B8860B] md:h-6 md:w-6 dark:text-[#FCD000]" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                    {/* <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Essential product details</p> */}
                  </div>
                </div>
                {renderVisibilityToggle("basicInformation", basicInformationEnabled, "Show basic product information on the public product page")}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <CustomTextField 
                    name="product_name"
                    id="product-name-input"
                    placeholder="Enter product name"
                    value={formProductData.product_name}
                    multiline={false}
                    rows={1}
                    type="text"
                    maxLength={100} 
                    onChange={handleInputChange}  
                    error={!!formError.product_name || !formProductData.product_name.trim()}
                    helperText={formError.product_name}
                    icon={<Package className="w-4 h-4" />}
                  /> 
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tagline *
                  </label>
                  <CustomTextField 
                    name="tagline"
                    id="tagline-input"
                    placeholder="Brief tagline of the product"
                    value={formProductData.tagline}
                    multiline={true}
                    rows={2}
                    type="text"
                    maxLength={200} 
                    onChange={handleInputChange}  
                    error={!!formError.tagline || !formProductData.tagline.trim()}
                    helperText={formError.tagline}
                    icon={<Tag className="w-4 h-4" />}
                  /> 
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <CustomTextField 
                    name="description"
                    id="description-input"
                    placeholder="Detailed description of the product"
                    value={formProductData.description}
                    multiline={true}
                    rows={3}
                    type="text"
                    maxLength={500} 
                    onChange={handleInputChange}  
                    error={!!formError.description || !formProductData.description.trim()}
                    helperText={formError.description}
                    icon={<Tag className="w-4 h-4" />}
                  /> 
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <CustomSelectField
                    name="category"
                    id="category-input"
                    placeholder="Select Category"
                    value={formProductData.category}
                    onChange={handleInputChange}
                    options={category}
                    fontSize="16px"
                    error={!!formError.category || !formProductData.category}
                    helperText={formError.category}
                  />
                </div>

                {/* Quantity field temporarily hidden. Keep this block for future reactivation.
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={decreaseQuantity} 
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-white font-semibold"
                    >
                      -
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        name="quantity"
                        value={formProductData.quantity}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FCD000] focus:border-transparent"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={increaseQuantity} 
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-white font-semibold"
                    >
                      +
                    </button>
                  </div>
                  {formError.quantity && <p className="text-red-600 text-sm mt-1">{formError.quantity}</p>}
                </div>
                */}
              </div>
            </div>

            {/* Gallery Section */}
            <div id="gallery-section" className="ecommerce-product-section bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="mb-4 flex items-start justify-between gap-3 md:mb-6">
                <div className="flex min-w-0 items-center gap-3 md:gap-4">
                  <div className="shrink-0 rounded-lg bg-[#FFF3C4] p-2 scale-125 origin-left md:p-3 dark:bg-[#5C4900]/30">
                    <ImageIcon className="h-5 w-5 text-[#B8860B] md:h-6 md:w-6 dark:text-[#FCD000]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Product Gallery</h2>
                    {/* <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Upload, crop, and adjust product images</p> */}
                  </div>
                </div> 
                <div className="ml-auto shrink-0 self-start">
                  {renderVisibilityToggle("gallery", galleryEnabled, "Show product gallery on the public product page")}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddImage}
                id="gallery-upload-button"
                className={`ecommerce-product-action mb-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 py-3 text-base font-semibold shadow-sm transition-colors ${gallery.filter((item) => item !== null).length === 0 || formError.gallery ? "border border-red-400 bg-red-50 text-red-700 hover:bg-red-100" : "bg-[#FCD000] text-gray-950 hover:bg-[#e9c000]"}`}
              >
                <Upload className="mr-2 h-4 w-4 min-[4000px]:h-6 min-[4000px]:w-6" />
                Upload Product Image
              </button>

              {formError.gallery && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{formError.gallery}</p>
                </div>
              )}

              <div className="ecommerce-product-media-grid grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {gallery.map((item, index) => {
                  if (!item) return null;

                  let preview = "";
                  if (item instanceof File) {
                    preview = URL.createObjectURL(item);
                  } else if (typeof item === "object" && "image_url" in item) {
                    preview = item.image_url;
                  }

                  return (
                    <div
                      key={index}
                      className="relative group overflow-hidden rounded-xl border-2 border-dashed border-[#FCD000] transition-colors hover:border-[#D4A900] dark:border-[#B8860B] dark:hover:border-[#FCD000]"
                    >
                      <button
                        type="button"
                        onClick={() => setMediaPreviewModal({ type: "gallery", url: preview })}
                        aria-label={`Open full product image preview ${index + 1}`}
                        className="aspect-[4/3] cursor-zoom-in w-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="object-contain w-full h-full"
                        />
                        <span className="pointer-events-none absolute left-2 top-2 z-20 rounded-md bg-black/65 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                          Open full preview
                        </span>
                      </button>
 
                      <button
                        type="button"
                        onClick={() => setPendingDelete({
                          type: "gallery",
                          index,
                          message: `Remove product image ${index + 1}?`,
                        })}
                        aria-label={`Remove product image ${index + 1}`}
                        title="Remove image"
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors z-10"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Product video */}
            <div id="product-video-section" className="ecommerce-product-section bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center">
                  <div className="mr-3 rounded-lg bg-[#FFF3C4] p-2 scale-125 origin-left md:mr-4 md:p-3 dark:bg-[#5C4900]/30">
                    <Video className="h-5 w-5 text-[#B8860B] md:h-6 md:w-6 dark:text-[#FCD000]" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Product Video</h2>
                    {/* <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Optional. This video is stored in S3 and shown on the public product page.</p> */}
                  </div>
                </div>
                <div className="ml-auto shrink-0 self-start">
                  {renderVisibilityToggle("video", videoEnabled, "Show product video on the public product page")}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <label
                  onClick={() => setVideoSource("upload")}
                  className="ecommerce-product-action inline-flex min-h-14 w-fit max-w-full cursor-pointer items-center gap-3 rounded-lg bg-[#FCD000] px-6 py-4 text-base font-semibold text-gray-950 shadow-sm transition-colors hover:bg-[#e9c000]"
                >
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(event) => {
                      setVideoSource("upload");
                      handleVideoChange(event.target.files?.[0] || null);
                      event.currentTarget.value = "";
                    }}
                  />
                  <span className="inline-flex items-center gap-2">
                    <Upload className="h-5 w-5 min-[4000px]:h-6 min-[4000px]:w-6" />
                    <span>{productVideo ? productVideo.name : "Upload product video"}</span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    markValidationInteraction();
                    setVideoSource("youtube");
                  }}
                  className={`ecommerce-product-action rounded-lg px-5 py-4 text-base font-semibold transition-colors ${videoSource === "youtube" ? "bg-[#FCD000] text-gray-950 hover:bg-[#e9c000]" : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"}`}
                >
                  Embed YouTube link
                </button>
              </div>

              {videoSource === "upload" ? (
              <>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="ecommerce-product-media-grid relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-black dark:border-gray-700">
                  {videoPreviewUrl ? (
                    <video className="h-full w-full object-contain" controls preload="metadata">
                      <source src={videoPreviewUrl} />
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-50 p-5 text-center text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                      Video preview will appear here
                    </div>
                  )}
                  {(productVideo || existingVideoUrl) && (
                    <button
                      type="button"
                      onClick={() => setPendingDelete({
                        type: productVideo ? "video-new" : "video-existing",
                        message: productVideo
                          ? `Remove selected product video "${productVideo.name}"?`
                          : "Remove the current product video?",
                      })}
                      disabled={isRemovingExistingVideo}
                      aria-label={productVideo ? "Clear selected product video" : "Remove current video"}
                      title={productVideo ? "Clear selected video" : "Remove current video"}
                      className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              </>
              ) : (
                <div className="ecommerce-product-media-grid mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-black dark:border-gray-700">
                    {youtubeEmbedUrl ? (
                      <iframe
                        className="h-full w-full"
                        src={youtubeEmbedUrl}
                        title="YouTube video preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-50 p-5 text-center text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                        YouTube preview will appear here
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="product-youtube-url" className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100">YouTube video link</label>
                    <input
                      id="product-youtube-url"
                      type="url"
                      value={youtubeUrl}
                      onChange={(event) => {
                        markValidationInteraction();
                        setYoutubeUrl(event.target.value);
                        setFormError((prev) => ({ ...prev, video: undefined }));
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className={`w-full rounded-lg border px-3 py-3 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#FCD000] dark:bg-gray-900 dark:text-white ${formError.video || (videoSource === "youtube" && !youtubeEmbedUrl) ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20" : "border-gray-300 dark:border-gray-600"}`}
                    />
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Only standard YouTube and youtu.be links are accepted.</p>
                  </div>
                </div>
              )}

              {formError.video && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{formError.video}</p>}
            </div>

            {/* Product brochure */}
            <div id="product-brochure-section" className="ecommerce-product-section bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center">
                  <div className="mr-3 rounded-lg bg-[#FFF3C4] p-2 scale-125 origin-left md:mr-4 md:p-3 dark:bg-[#5C4900]/30">
                    <FileText className={`h-5 w-5 md:h-6 md:w-6 ${PRODUCT_UPLOAD_ICON_CLASS}`} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Product Brochure</h2>
                    {/* <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Optional PDF stored in S3. Customers can download it from the product detail page.</p> */}
                  </div>
                </div>
                <div className="ml-auto shrink-0 self-start">
                  {renderVisibilityToggle("brochure", brochureEnabled, "Show product brochure download on the public product page")}
                </div>
              </div>

                <label className={`ecommerce-product-action mt-4 inline-flex min-h-12 w-fit max-w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${formError.brochure ? "border border-red-400 bg-red-50 text-red-700 hover:bg-red-100" : "bg-[#FCD000] text-gray-950 hover:bg-[#E5BB00]"}`}>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleBrochureChange(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
                <span className="inline-flex min-w-0 items-center gap-2">
               <Upload className="h-5 w-5 min-[4000px]:h-6 min-[4000px]:w-6" />
                  <span className="truncate">Upload product brochure{productBrochures.length ? ` (${productBrochures.length} selected)` : ""}</span>
                </span>
              </label>

              <div className="ecommerce-product-media-grid mt-4 grid gap-4 lg:grid-cols-2 lg:items-stretch">
                {existingBrochures.length === 0 && productBrochures.length === 0 ? (
                  <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    Brochure preview will appear here
                  </div>
                ) : (
                  [...existingBrochures.map((brochure) => ({
                    key: `existing-${brochure.id ?? "legacy"}`,
                    url: brochure.brochure_url,
                    filename: brochure.original_filename,
                    existing: true,
                    brochure,
                  })), ...productBrochures.map((file, index) => ({
                    key: `new-${index}`,
                    url: brochurePreviewUrls[index],
                    filename: file.name,
                    existing: false,
                    brochure: null,
                  }))].map((brochure) => (
                    <div key={brochure.key} className="group relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                      {brochure.url && <PdfPagePreview url={brochure.url} title={brochure.filename} />}
                      <button
                        type="button"
                        aria-label={`Open preview for ${brochure.filename}`}
                        onClick={() => setMediaPreviewModal({ type: "brochure", url: brochure.url })}
                        className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                      />
                      <span className="absolute bottom-2 left-2 right-2 z-20 truncate rounded bg-black/65 px-2 py-1 text-xs font-semibold text-white">
                        {brochure.filename}
                      </span>
                      <button
                        type="button"
                        onClick={() => brochure.existing && brochure.brochure
                          ? setPendingDelete({
                              type: "brochure-existing",
                              brochure: brochure.brochure,
                              message: `Remove brochure "${brochure.filename}"?`,
                            })
                          : setPendingDelete({
                              type: "brochure-new",
                              index: Number(brochure.key.replace("new-", "")),
                              message: `Remove selected brochure "${brochure.filename}"?`,
                            })}
                        disabled={isRemovingExistingBrochure}
                        aria-label={`Remove ${brochure.filename}`}
                        className="absolute right-2 top-2 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}

              </div>

              {formError.brochure && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{formError.brochure}</p>}
            </div>

            {/* Long product specification highlight image */}
            <div id="specification-highlight-section" className="ecommerce-product-section bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center">
                  <div className="mr-3 rounded-lg bg-[#FFF3C4] p-2 scale-125 origin-left md:mr-4 md:p-3 dark:bg-[#5C4900]/30">
                    <ImageIcon className="h-5 w-5 text-[#B8860B] md:h-6 md:w-6 dark:text-[#FCD000]" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Product Specifications Highlight</h2>
                    {/* <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Optional long image displayed after the text specifications on the product detail page.</p> */}
                  </div>
                </div>
                {renderVisibilityToggle("specsHighlight", productSpecsHighlightEnabled, "Show product specification highlight image on the public product page")}
              </div>

                <label className={`ecommerce-product-action mt-4 inline-flex min-h-12 w-fit max-w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${formError.specsHighlight ? "border border-red-400 bg-red-50 text-red-700 hover:bg-red-100" : "bg-[#FCD000] text-gray-950 hover:bg-[#E5BB00]"}`}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    handleProductSpecsHighlightChange(event.target.files?.[0] || null);
                    event.currentTarget.value = "";
                  }}
                />
                <span className="inline-flex min-w-0 items-center gap-2">
                   <Upload className="h-5 w-5 min-[4000px]:h-6 min-[4000px]:w-6" />
                  <span className="truncate">{productSpecsHighlight ? productSpecsHighlight.name : "Upload specification image"}</span>
                </span>
              </label>

              <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-stretch">
                {productSpecsHighlightPreviewUrl || existingProductSpecsHighlightUrl ? (
                  <div className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                    <button
                      type="button"
                      onClick={() => setMediaPreviewModal({
                        type: "specification",
                        url: productSpecsHighlightPreviewUrl || existingProductSpecsHighlightUrl,
                      })}
                      aria-label="Open full product specification highlight preview"
                      className="group relative flex h-full w-full items-center justify-center"
                    >
                      <img
                        src={productSpecsHighlightPreviewUrl || existingProductSpecsHighlightUrl}
                        alt="Product specification highlight preview"
                        className="h-full w-full object-contain"
                      />
                      <span className="pointer-events-none absolute left-2 top-2 z-20 rounded-md bg-black/65 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                        Open full preview
                      </span>
                    </button>
                    {(productSpecsHighlight || existingProductSpecsHighlightUrl) && (
                      <button
                        type="button"
                        onClick={() => setPendingDelete({
                          type: productSpecsHighlight ? "spec-highlight-new" : "spec-highlight-existing",
                          message: productSpecsHighlight
                            ? `Remove selected specification highlight image "${productSpecsHighlight.name}"?`
                            : "Remove the current specification highlight image?",
                        })}
                        disabled={isRemovingProductSpecsHighlight}
                        aria-label={productSpecsHighlight ? "Clear selected specification highlight image" : "Remove current specification highlight image"}
                        title={productSpecsHighlight ? "Clear selected image" : "Remove current image"}
                        className="absolute right-2 top-2 z-30 rounded-full bg-red-500 p-1.5 text-white shadow transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    Specification image preview will appear here
                  </div>
                )}

              </div>

              {formError.specsHighlight && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{formError.specsHighlight}</p>}
            </div>

            {/* Quick product highlights shown on the public product-card hover */}
            <div id="quick-highlights-section" className="ecommerce-product-section bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="mb-4 flex items-start justify-between gap-3 md:mb-6">
                <div className="flex min-w-0 items-center">
                  <div className="mr-3 rounded-lg bg-[#FFF3C4] p-2 scale-125 origin-left md:mr-4 md:p-3 dark:bg-[#5C4900]/30">
                    <Package className="h-5 w-5 text-[#B8860B] md:h-6 md:w-6 dark:text-[#FCD000]" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Quick Product Highlights</h2>
                    {/* <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">These four ordered details appear on the product-card hover and at the top of the product-detail page.</p> */}
                  </div>
                </div>
                {renderVisibilityToggle("quickProductHighlight", quickProductHighlightEnabled, "Show quick product highlights on the public product page")}
              </div>

              {quickHighlightError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-sm text-red-600 dark:text-red-400">{quickHighlightError}</p>
                </div>
              )}

              <div ref={quickHighlightsRef} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {hoverSpecs.map((h, idx) => (
                  <div
                    key={idx}
                    id={`quick-highlight-card-${idx}`}
                    className={`quick-highlight-card group relative rounded-lg border p-4 ${!h.specs_key.trim() || !h.specs_value.trim() ? "border-red-300 bg-red-100/80 shadow-[0_4px_14px_rgba(239,68,68,0.22)] dark:border-red-700 dark:bg-red-900/30 dark:shadow-[0_4px_14px_rgba(248,113,113,0.18)]" : "border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-900/10"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Drag handle. Reorder highlight ${idx + 1}`}
                          title="Drag to reorder"
                          className="quick-highlight-drag-handle inline-flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-indigo-500 hover:bg-indigo-100 active:cursor-grabbing dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                        >
                          <GripVertical className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300" htmlFor={`quick-highlight-title-${idx}`}>
                          Highlight title
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveIconPicker(idx)}
                        aria-label={`Change icon for highlight ${idx + 1}`}
                        title="Change icon"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                      >
                        <LucideIcon name={h.icon} size={22} aria-hidden="true" />
                      </button>
                    </div>
                    <input
                      id={`quick-highlight-title-${idx}`}
                      type="text"
                      placeholder={`e.g., ${QUICK_HIGHLIGHT_FIELDS[idx].key}`}
                      className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#FCD000] dark:bg-gray-800 dark:text-white ${!h.specs_key.trim() ? "border-red-500 bg-red-100 dark:border-red-400 dark:bg-red-900/30" : "border-gray-300 dark:border-gray-600"}`}
                      value={h.specs_key}
                      onChange={(e) => handleHoverSpecChange(idx, "specs_key", e.target.value)}
                    />
                    <label className="mt-3 block text-xs font-bold text-gray-700 dark:text-gray-300" htmlFor={`quick-highlight-${idx}`}>
                      Highlight value
                    </label>
                    <input
                      id={`quick-highlight-${idx}`}
                      type="text"
                      placeholder={QUICK_HIGHLIGHT_FIELDS[idx].placeholder}
                      className={`mt-3 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#FCD000] dark:bg-gray-800 dark:text-white ${!h.specs_value.trim() ? "border-red-500 bg-red-100 dark:border-red-400 dark:bg-red-900/30" : "border-gray-300 dark:border-gray-600"}`}
                      value={h.specs_value}
                      onChange={(e) => handleHoverSpecChange(idx, "specs_value", e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {activeIconPicker !== null && hoverSpecs[activeIconPicker] && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-gray-900">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose highlight icon</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">For: {hoverSpecs[activeIconPicker].specs_key || `Highlight ${activeIconPicker + 1}`}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveIconPicker(null)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                        aria-label="Close icon picker"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <CustomIconPicker
                      value={hoverSpecs[activeIconPicker].icon}
                      onChange={(iconName) => {
                        handleHoverSpecChange(activeIconPicker, "icon", iconName);
                        setActiveIconPicker(null);
                      }}
                      label="Select the icon shown on the product card"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="ecommerce-product-section product-details-section bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center">
                    <div className="mr-3 rounded-lg bg-[#FFF3C4] p-2 scale-125 origin-left md:mr-4 md:p-3 dark:bg-[#5C4900]/30">
                      <FileText className="h-5 w-5 text-[#B8860B] md:h-6 md:w-6 dark:text-[#FCD000]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Details</h2>
                  </div>
                </div>
                {renderVisibilityToggle("details", detailsEnabled, "Show details on the public product page")}
              </div>

              <div className="product-details-editor mt-5">
                <RichTextEditor
                  value={formProductData.details}
                  onChange={(value) => {
                    setProductData((previous) => ({ ...previous, details: value }));
                    setFormError((previous) => ({ ...previous, details: undefined }));
                  }}
                  placeholder="Add formatted product specifications"
                />
                {formError.details && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formError.details}</p>}
              </div>
            </div>

            {/* Specifications Section */}
            <div id="specifications-section" className="ecommerce-product-section bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="mb-4 flex items-start justify-between gap-3 md:mb-6">
                <div className="flex min-w-0 items-center gap-3 md:gap-4">
                    <div className="shrink-0 rounded-lg bg-[#FFF3C4] p-2 scale-125 origin-left md:p-3 dark:bg-[#5C4900]/30">
                      <Settings className="h-5 w-5 text-[#B8860B] md:h-6 md:w-6 dark:text-[#FCD000]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Specifications</h2>
                    {/* <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Add detailed product specifications</p> */}
                  </div>
                </div>
                {renderVisibilityToggle("specifications", specificationsEnabled, "Show product specifications on the public product page")}
              </div>

              <button
                type="button"
                onClick={handleAddCategory}
                id="add-specification-category-button"
                className="mb-4 inline-flex items-center justify-center rounded-lg bg-[#FCD000] px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors hover:bg-[#D4A900] md:px-4 md:text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>

              {specificationError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{specificationError}</p>
                </div>
              )}

              <div className="space-y-4 md:space-y-6">
                {specs.map((cat, catIndex) => (
                  <div
                    key={catIndex}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50"
                  >
                    {/* Category Header */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 gap-3">
                      <div className="flex-1">
                        <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category Title
                        </label>
                        <input
                          id={`spec-category-${catIndex}-title`}
                          type="text"
                          placeholder="e.g., Performance, Design, Features"
                          className={`w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#FCD000] focus:border-transparent transition-colors dark:text-white ${!String(cat.title || "").trim() ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20" : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"}`}
                          value={cat.title}
                          onChange={(e) => handleTitleChange(catIndex, e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setPendingDelete({
                          type: "spec-category",
                          catIndex,
                          message: `Remove ${cat.title.trim() ? `specification category "${cat.title}"` : "this specification category"}?`,
                        })}
                        aria-label={`Remove ${cat.title || "specification category"}`}
                        className="inline-flex !h-10 !min-h-10 !w-10 !min-w-10 shrink-0 items-center justify-center overflow-visible rounded-lg bg-red-500 !p-0 text-white transition-colors hover:bg-red-600 self-end sm:self-auto"
                      >
                        <X className="!h-5 !min-h-5 !w-5 !min-w-5 text-white" strokeWidth={3} aria-hidden="true" />
                      </button>
                    </div>

                    {/* Fields */}
                    <div className="space-y-3">
                      {cat.fields.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm italic text-center py-4">
                          No fields added yet. Click "Add Field" to get started.
                        </p>
                      )}

                      {cat.fields.map((field, fieldIndex) => (
                        <div
                          key={fieldIndex}
                          className="flex flex-col sm:flex-row gap-2 md:gap-3 items-stretch sm:items-end"
                        >
                          <div className="flex-1">
                            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Key
                            </label>
                            <input
                              id={`spec-category-${catIndex}-field-${fieldIndex}-key`}
                              type="text"
                              placeholder="e.g., Processor, RAM, Storage"
                              className={`w-full px-3 py-2 text-sm md:text-base border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#FCD000] focus:border-transparent transition-colors dark:text-white ${String(field.specs_value || "").trim() && !String(field.specs_key || "").trim() ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20" : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"}`}
                              value={field.specs_key}
                              onChange={(e) =>
                                handleChange(catIndex, fieldIndex, "specs_key", e.target.value)
                              }
                            />
                          </div>

                          <div className="flex-1">
                            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Value
                            </label>
                            <input
                              id={`spec-category-${catIndex}-field-${fieldIndex}-value`}
                              type="text"
                              placeholder="e.g., Intel Core i7, 16GB, 512GB SSD"
                              className={`w-full px-3 py-2 text-sm md:text-base border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#FCD000] focus:border-transparent transition-colors dark:text-white ${String(field.specs_key || "").trim() && !String(field.specs_value || "").trim() ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20" : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"}`}
                              value={field.specs_value}
                              onChange={(e) =>
                                handleChange(catIndex, fieldIndex, "specs_value", e.target.value)
                              }
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => setPendingDelete({
                              type: "spec-field",
                              catIndex,
                              fieldIndex,
                              message: `Remove ${field.specs_key.trim() ? `specification field "${field.specs_key}"` : "this specification field"}?`,
                            })}
                            aria-label={`Remove ${field.specs_key || "specification field"}`}
                            className="inline-flex !h-10 !min-h-10 !w-10 !min-w-10 shrink-0 self-end items-center justify-center overflow-visible rounded-lg bg-red-500 !p-0 text-white transition-colors hover:bg-red-600 sm:self-auto"
                          >
                            <X className="!h-5 !min-h-5 !w-5 !min-w-5 text-white" strokeWidth={3} aria-hidden="true" />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => handleAddField(catIndex)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-[#FCD000] hover:text-[#FCD000] transition-colors"
                      >
                        <Plus className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary (Desktop) */}
          <div className="ecommerce-product-summary-column">
            <div className="ecommerce-product-summary sticky top-4 flex max-h-[calc(100vh-9rem)] flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Form Summary</h3>
              
              {/* Progress Bar */}
              <div className="ecommerce-product-summary__progress mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Completion</span>
                  <span className="text-sm text-gray-900 dark:text-white">{calculateCompletion()}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#FCD000] to-[#FCD000]/80 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateCompletion()}%` }}
                  ></div>
                </div>
              </div>

              <div className="ecommerce-product-summary__sections min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                {renderSummarySection(
                  "Basic Information",
                  `${formProductData.product_name ? "Product name added" : "No basic information added"}`,
                  basicInformationComplete,
                  basicInformationErrors,
                  "basic-information"
                )}
                {renderSummarySection(
                  "Product Gallery",
                  `${gallery.filter((item) => item !== null).length} image${gallery.filter((item) => item !== null).length !== 1 ? "s" : ""} uploaded`,
                  gallery.filter((item) => item !== null).length > 0,
                  mediaErrors,
                  "media"
                )}
                {renderSummarySection(
                  "Details",
                  formProductData.details.trim() ? "Details added" : "No details added",
                  true,
                  [],
                  "details"
                )}
                {renderSummarySection(
                  "Quick Product Highlights",
                  `${hoverSpecs.length} highlight${hoverSpecs.length !== 1 ? "s" : ""} added`,
                  hasCompleteHoverSpecs,
                  quickHighlightErrors,
                  "quick-highlights"
                )}
                {renderSummarySection(
                  "Specifications",
                  `${specs.length} categor${specs.length !== 1 ? "ies" : "y"} added`,
                  hasCompleteDetailedSpecs,
                  specificationSummaryErrors,
                  "specifications"
                )}
              </div>

              <div className="ecommerce-product-summary__status mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex items-center text-sm">
                  {calculateCompletion() === 100 ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-600 dark:text-green-400">All fields completed</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-yellow-600 dark:text-yellow-400">Complete all fields</span>
                    </>
                  )}
                </div>
              </div>

              <div className="ecommerce-product-summary__actions mt-5 flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate('/beesee/ecommerce/product')}
                  disabled={isCreating || isUpdating}
                className="flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isCreating || isUpdating}
                  className="flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#FCD000] px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-[#e9c000] disabled:opacity-50"
                >
                  {isCreating || isUpdating ? (
                    <span>{id ? "Updating..." : "Creating..."}</span>
                  ) : (
                    <>
                      {/* <Save className="mr-2 h-[18px] w-[18px] min-[4000px]:h-6 min-[4000px]:w-6" /> */}
                      <span>{id ? "Update Product" : "Create Product"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Summary (Bottom Sheet Style) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Form Progress</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{calculateCompletion()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#FCD000] to-[#FCD000]/80 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateCompletion()}%` }}
              ></div>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-2 text-center text-xs">
              <div>
                {renderMobileProgressStatus(basicInformationComplete, "Basic Information", basicInformationErrors, "basic-information-section")}
                <span className="text-gray-600 dark:text-gray-400">Basic</span>
              </div>
              <div>
                {renderMobileProgressStatus(
                  gallery.filter((item) => item !== null).length > 0,
                  "Product Gallery",
                  mediaErrors,
                  "gallery-section"
                )}
                <span className="text-gray-600 dark:text-gray-400">Gallery</span>
              </div>
              <div>
                <div className="mx-auto mb-1 h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Details</span>
              </div>
              <div>
                {renderMobileProgressStatus(hasCompleteHoverSpecs, "Quick Product Highlights", quickHighlightErrors, "quick-highlights-section")}
                <span className="text-gray-600 dark:text-gray-400">Highlights</span>
              </div>
              <div>
                {renderMobileProgressStatus(hasCompleteDetailedSpecs, "Specifications", specificationSummaryErrors, "specifications-section")}
                <span className="text-gray-600 dark:text-gray-400">Specs</span>
              </div>
            </div>
            <div className="mt-3 flex gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/beesee/ecommerce/product')}
                disabled={isCreating || isUpdating}
                className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-gray-300 px-4 py-3 text-base font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#FCD000] px-4 py-3 text-base font-semibold text-gray-900 hover:bg-[#e9c000] disabled:opacity-50"
              >
                {isCreating || isUpdating ? (id ? "Updating..." : "Creating...") : (id ? "Update" : "Create")}
              </button>
            </div>
          </div>
          </div>

        {mediaPreviewModal && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-media-preview-title"
            onClick={() => setMediaPreviewModal(null)}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:px-6">
                <h2 id="product-media-preview-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mediaPreviewModal.type === "brochure"
                    ? "Product brochure preview"
                    : mediaPreviewModal.type === "gallery"
                      ? "Product image preview"
                      : "Specification image preview"}
                </h2>
                <button
                  type="button"
                  onClick={() => setMediaPreviewModal(null)}
                  aria-label="Close preview"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[75dvh] min-h-[360px] overflow-hidden bg-gray-100 p-1.5 dark:bg-gray-950 sm:p-3 md:p-5">
                {mediaPreviewModal.type === "brochure" ? (
                  <PdfPagePreview
                    url={mediaPreviewModal.url}
                    title="Full product brochure preview"
                    className="h-full min-h-[328px] rounded-lg bg-white"
                  />
                ) : (
                  <img
                    src={mediaPreviewModal.url}
                    alt={mediaPreviewModal.type === "gallery"
                      ? "Full product image preview"
                      : "Full product specification highlight preview"}
                    className="mx-auto max-h-[75vh] max-w-full rounded-lg object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {isGalleryUploadOpen && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-upload-title"
            onClick={() => setIsGalleryUploadOpen(false)}
          >
            <div
              className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                <div>
                  <h2 id="gallery-upload-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Add product image
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Select one or more images. Each image can be cropped and adjusted before it is added to the gallery.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGalleryUploadOpen(false)}
                  aria-label="Close image upload"
                  className="ml-4 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5">
                <input
                  id="new-gallery-image-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    handleNewGalleryFiles(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
                <label
                  htmlFor="new-gallery-image-input"
                  className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D4A900] bg-amber-50 px-8 py-10 text-center transition-colors hover:bg-amber-100 dark:border-[#FCD000] dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
                >
                  <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FCD000] text-black">
                    <Upload className="h-7 w-7" />
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">Choose product images</span>
                  <span className="mt-1 text-sm text-gray-600 dark:text-gray-400">Select multiple images from your device</span>
                </label>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsGalleryUploadOpen(false)}
                    className="inline-flex min-h-12 min-w-28 items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ImageCropAdjustDialog
          file={imageToEdit?.file ?? null}
          onCancel={cancelGalleryImageEdit}
          onApply={applyEditedImage}
        />

        {/* Add padding at bottom for mobile summary */}
        <div className="lg:hidden h-24"></div>
      </div>
    </div>
  );
};

export default ProductForm;
