import React, { useEffect, useRef, useState } from "react";
// @ts-ignore: Vite resolves the PDF.js worker URL at build time.
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore: Vite resolves the PDF.js worker URL at build time.
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
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
  GripVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomTextField from "../../../components/Fields/CustomTextField";
import CustomSelectField from "../../../components/Fields/CustomSelectField";
import RichTextEditor from "../../../components/Fields/RichTextEditor";
import ImageCropAdjustDialog from "../../../components/Fields/ImageCropAdjustDialog";
import CustomIconPicker from "../../../components/Fields/CustomIconPicker";
import { LucideIcon } from "../../../utils/lucideIconLoader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createProduct, 
  fetchCategory, 
  fetchSpecificProduct, 
  updateProduct,
  deleteProductVideo,
  deleteProductBrochure,
  deleteProductSpecsHighlight,
  updateProductVisibility,
} from '../../../services/Ecommerce/productServices'
import Snackbar from '../../../components/feedback/Snackbar'; 
import { Switch } from '@mui/material';
import { AlertColor } from '@mui/material/Alert';
import { userAuth } from "../../../hooks/userAuth";
import Product from "../../TechnicianPage/Product/Product";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
  specs?: string;
}

type GalleryItem = 
  | { image_id: number; image_url: string }  // existing DB image
  | File                                     // new uploaded image
  | null;                                    // empty slot

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

const PdfPagePreview: React.FC<{ url: string; title: string; className?: string }> = ({
  url,
  title,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pdfDocument: { getPage: (pageNumber: number) => Promise<any>; destroy: () => Promise<void> } | null = null;
    let renderTask: { promise: Promise<void>; cancel: () => void } | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const renderPage = async () => {
      const canvas = canvasRef.current;
      const container = canvas?.parentElement;
      if (!canvas || !container) return;

      try {
        setPreviewError(false);
        pdfDocument = await pdfjsLib.getDocument({ url }).promise;
        if (cancelled) return;

        const page = await pdfDocument.getPage(1);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(container.clientWidth - 16, 1);
        const availableHeight = Math.max(container.clientHeight - 16, 1);
        const scale = Math.min(
          availableWidth / baseViewport.width,
          availableHeight / baseViewport.height,
        );
        const viewport = page.getViewport({ scale });
        const devicePixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.ceil(viewport.width * devicePixelRatio);
        canvas.height = Math.ceil(viewport.height * devicePixelRatio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas rendering is unavailable.");

        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to render product brochure preview:", error);
          setPreviewError(true);
        }
      }
    };

    const scheduleRender = () => requestAnimationFrame(() => void renderPage());
    scheduleRender();

    if (canvasRef.current?.parentElement && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(scheduleRender);
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      renderTask?.cancel();
      void pdfDocument?.destroy();
    };
  }, [url]);

  return (
    <div className={`flex h-full w-full items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900 ${className}`}>
      {previewError ? (
        <span className="px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Preview unavailable
        </span>
      ) : (
        <canvas ref={canvasRef} aria-label={title} className="block max-h-full max-w-full object-contain" />
      )}
    </div>
  );
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

  // Keep four easy-to-complete highlights, while allowing each product to name them.
  const [hoverSpecs, setHoverSpecs] = useState<{
    specs_key: string;
    specs_value: string;
    icon?: string;
  }[]>(createQuickHighlightSpecs);
  const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null);
  const quickHighlightsRef = useRef<HTMLDivElement | null>(null);

  const handleHoverSpecChange = (
    index: number,
    field: "specs_key" | "specs_value" | "icon",
    value: string
  ) => {
    const updated = [...hoverSpecs];
    updated[index][field] = value;
    setHoverSpecs(updated);
    setFormError((prev) => ({ ...prev, specs: undefined }));
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

        setHoverSpecs((previous) => {
          const reordered = [...previous];
          const [movedHighlight] = reordered.splice(oldIndex, 1);
          reordered.splice(newIndex, 0, movedHighlight);
          return reordered;
        });
        setFormError((previous) => ({ ...previous, specs: undefined }));
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
  const [productBrochure, setProductBrochure] = useState<File | null>(null);
  const [existingBrochureUrl, setExistingBrochureUrl] = useState("");
  const [brochurePreviewUrl, setBrochurePreviewUrl] = useState("");
  const [productSpecsHighlight, setProductSpecsHighlight] = useState<File | null>(null);
  const [existingProductSpecsHighlightUrl, setExistingProductSpecsHighlightUrl] = useState("");
  const [productSpecsHighlightPreviewUrl, setProductSpecsHighlightPreviewUrl] = useState("");
  const [mediaPreviewModal, setMediaPreviewModal] = useState<MediaPreviewModal>(null);
  const [isRemovingProductSpecsHighlight, setIsRemovingProductSpecsHighlight] = useState(false);
  const [isRemovingExistingBrochure, setIsRemovingExistingBrochure] = useState(false);
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
    if (!productBrochure) {
      setBrochurePreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(productBrochure);
    setBrochurePreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [productBrochure]);

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

    if (!file.type.startsWith("video/")) {
      setFormError((prev) => ({ ...prev, video: "Please select a video file." }));
      return;
    }
    if (!registerFileUpload("video")) return;

    setProductVideo(file);
    setFormError((prev) => ({ ...prev, video: undefined }));
  };

  const handleBrochureChange = (file: File | null) => {
    if (!file) return;

    if (file.type !== "application/pdf" || !/\.pdf$/i.test(file.name)) {
      setFormError((prev) => ({ ...prev, brochure: "Please select a PDF brochure." }));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setFormError((prev) => ({ ...prev, brochure: "The brochure must be 20 MB or smaller." }));
      return;
    }
    if (!registerFileUpload("brochure")) return;

    setProductBrochure(file);
    setFormError((prev) => ({ ...prev, brochure: undefined }));
  };

  const handleProductSpecsHighlightChange = (file: File | null) => {
    if (!file) return;
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
    setPendingGalleryFiles([]);
    setIsGalleryUploadOpen(true);
  };

  const [removedImages, setRemovedImages] = useState<number[]>([]);

  const handleRemoveImage = (index: number) => {
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
    setSpecs([...specs, { title: "", fields: [] }]);
  };

  const handleAddField = (catIndex: number) => {
    const updated = [...specs];
    updated[catIndex].fields.push({ specs_key: "", specs_value: "" });
    setSpecs(updated);
  };

  const handleRemoveField = (catIndex: number, fieldIndex: number) => {
    const updated = [...specs];
    updated[catIndex].fields.splice(fieldIndex, 1);
    setSpecs(updated);
  };

  const handleRemoveCategory = (catIndex: number) => {
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
    const updated = [...specs];
    updated[catIndex].fields[fieldIndex][fieldName] = value;
    setSpecs(updated);
    // clear specs error when user edits any spec field
    setFormError((prev) => ({ ...prev, specs: undefined }));
  };

  // --- Category title ---
  const handleTitleChange = (catIndex: number, value: string) => {
    const updated = [...specs];
    updated[catIndex].title = value;
    setSpecs(updated);
    // clear specs error when user edits a category title
    setFormError((prev) => ({ ...prev, specs: undefined }));
  };
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

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
      errors.specs = "Please complete all four quick product highlights.";
    }

    // Validate the four customer-facing product highlights.
    for (let h = 0; h < hoverSpecs.length; h++) {
      const hs = hoverSpecs[h];
      const k = String(hs.specs_key || "").trim();
      const v = String(hs.specs_value || "").trim();
      if (!k || !v) {
        errors.specs = `Quick highlight ${h + 1} needs both a title and a value.`;
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
    if (!productDatabaseId || !existingBrochureUrl || isRemovingExistingBrochure) return;

    setIsRemovingExistingBrochure(true);
    try {
      await removeProductBrochureMutation.mutateAsync(productDatabaseId);
      setExistingBrochureUrl("");
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
      // 1️⃣ Validate form
      const errors = validateForm();
      setFormError(errors);
      if (Object.keys(errors).length > 0) {
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
      if (productBrochure) {
        formData.append("brochure", productBrochure);
      }
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
    data: category = []
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
        ...mapped
      ]
    }
  });

  // Inside your render / summary section:
  const selectedCategoryLabel =
    category.find((cat) => cat.value === formProductData.category)?.label ||
    "Not selected";

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
      setProductBrochure(null);
      setBrochureEnabled(productInfo.brochure_enabled !== false && productInfo.brochure_enabled !== 0 && productInfo.brochure_enabled !== "0");
      setProductSpecsHighlightEnabled(productInfo.product_specs_highlight_enabled !== false && productInfo.product_specs_highlight_enabled !== 0 && productInfo.product_specs_highlight_enabled !== "0");
      setBasicInformationEnabled(isVisibilityEnabled(productInfo.basic_information_enabled));
      setDetailsEnabled(isVisibilityEnabled(productInfo.details_enabled));
      setGalleryEnabled(isVisibilityEnabled(productInfo.gallery_enabled));
      setQuickProductHighlightEnabled(isVisibilityEnabled(productInfo.quick_product_highlight_enabled));
      setSpecificationsEnabled(isVisibilityEnabled(productInfo.specifications_enabled));
      setExistingBrochureUrl(
        [productInfo.brochure_url, productInfo.brochureUrl, productInfo.product_brochure]
          .find((value): value is string => typeof value === "string" && value.length > 0) || ""
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
      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Notification */} 
        <Snackbar 
          open={snackBarOpen}
          type={snackBarType}
          message={snackBarMessage}
          onClose={() => setSnackBarOpen(false)}
        />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              { id ? "Update Product" : "Create New Product" }
            </h1>
            {/* <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Add a new product to your inventory with detailed specifications
            </p> */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-4 md:space-y-8">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
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
                    placeholder="Enter product name"
                    value={formProductData.product_name}
                    multiline={false}
                    rows={1}
                    type="text"
                    maxLength={100} 
                    onChange={handleInputChange}  
                    error={!!formError.product_name}
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
                    placeholder="Brief tagline of the product"
                    value={formProductData.tagline}
                    multiline={true}
                    rows={2}
                    type="text"
                    maxLength={200} 
                    onChange={handleInputChange}  
                    error={!!formError.tagline}
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
                    placeholder="Detailed description of the product"
                    value={formProductData.description}
                    multiline={true}
                    rows={3}
                    type="text"
                    maxLength={500} 
                    onChange={handleInputChange}  
                    error={!!formError.description}
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
                    placeholder="Select Category"
                    value={formProductData.category}
                    onChange={handleInputChange}
                    options={category}
                    fontSize="16px"
                    error={!!formError.category}
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
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
                className="mb-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#FCD000] px-5 py-3 text-base font-semibold text-gray-950 shadow-sm transition-colors hover:bg-[#e9c000]"
              >
                <Upload className="mr-2 h-4 w-4 min-[4000px]:h-6 min-[4000px]:w-6" />
                Upload Image
              </button>

              {formError.gallery && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{formError.gallery}</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
                        onClick={() => handleRemoveImage(index)}
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
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
                  className="inline-flex min-h-14 w-fit max-w-full cursor-pointer items-center gap-3 rounded-lg bg-[#FCD000] px-6 py-4 text-base font-semibold text-gray-950 shadow-sm transition-colors hover:bg-[#e9c000]"
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
                    <span>{productVideo ? productVideo.name : "Choose product video"}</span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setVideoSource("youtube");
                  }}
                  className={`rounded-lg px-5 py-4 text-base font-semibold transition-colors ${videoSource === "youtube" ? "bg-[#FCD000] text-gray-950 hover:bg-[#e9c000]" : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"}`}
                >
                  Embed YouTube link
                </button>
              </div>

              {videoSource === "upload" ? (
              <>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-black dark:border-gray-700">
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
                      onClick={productVideo ? () => {
                        setProductVideo(null);
                        setFormError((prev) => ({ ...prev, video: undefined }));
                      } : handleRemoveExistingVideo}
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
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
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
                        setYoutubeUrl(event.target.value);
                        setFormError((prev) => ({ ...prev, video: undefined }));
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#FCD000] dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Only standard YouTube and youtu.be links are accepted.</p>
                  </div>
                </div>
              )}

              {formError.video && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{formError.video}</p>}
            </div>

            {/* Product brochure */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
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

                <label className="mt-4 inline-flex min-h-12 w-fit max-w-full cursor-pointer items-center gap-2 rounded-lg bg-[#FCD000] px-4 py-3 text-sm font-semibold text-gray-950 shadow-sm transition-colors hover:bg-[#E5BB00]">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(event) => {
                    handleBrochureChange(event.target.files?.[0] || null);
                    event.currentTarget.value = "";
                  }}
                />
                <span className="inline-flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{productBrochure ? productBrochure.name : "Choose product brochure"}</span>
                </span>
              </label>

              <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-stretch">
                {brochurePreviewUrl || existingBrochureUrl ? (
                  <div className="group relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                    <PdfPagePreview
                      url={brochurePreviewUrl || existingBrochureUrl}
                      title="Product brochure preview"
                    />
                    <button
                      type="button"
                      aria-label="Open full product brochure preview"
                      onClick={() => setMediaPreviewModal({
                        type: "brochure",
                        url: brochurePreviewUrl || existingBrochureUrl,
                      })}
                      className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPreviewModal({
                        type: "brochure",
                        url: brochurePreviewUrl || existingBrochureUrl,
                      })}
                      aria-label="Open full product brochure preview"
                      className="absolute left-2 top-2 z-20 rounded-md bg-black/65 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow transition-opacity hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
                    >
                      Open full preview
                    </button>
                    {(productBrochure || existingBrochureUrl) && (
                      <button
                        type="button"
                        onClick={productBrochure ? () => {
                          setProductBrochure(null);
                          setFormError((prev) => ({ ...prev, brochure: undefined }));
                        } : handleRemoveExistingBrochure}
                        disabled={isRemovingExistingBrochure}
                        aria-label={productBrochure ? "Clear selected brochure" : "Remove current brochure"}
                        title={productBrochure ? "Clear selected brochure" : "Remove current brochure"}
                        className="absolute right-2 top-2 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    Brochure preview will appear here
                  </div>
                )}

              </div>

              {formError.brochure && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{formError.brochure}</p>}
            </div>

            {/* Long product specification highlight image */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
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

                <label className="mt-4 inline-flex min-h-12 w-fit max-w-full cursor-pointer items-center gap-2 rounded-lg bg-[#FCD000] px-4 py-3 text-sm font-semibold text-gray-950 shadow-sm transition-colors hover:bg-[#E5BB00]">
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
                  <ImageIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{productSpecsHighlight ? productSpecsHighlight.name : "Choose specification image"}</span>
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
                        onClick={productSpecsHighlight ? () => {
                          setProductSpecsHighlight(null);
                          setFormError((prev) => ({ ...prev, specsHighlight: undefined }));
                        } : handleRemoveExistingProductSpecsHighlight}
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
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

              <div ref={quickHighlightsRef} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {hoverSpecs.map((h, idx) => (
                  <div
                    key={idx}
                    className="quick-highlight-card group relative rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-900/10"
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
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#FCD000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                      className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#FCD000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
            <div className="product-details-section bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
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
                className="mb-4 inline-flex items-center justify-center rounded-lg bg-[#FCD000] px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors hover:bg-[#D4A900] md:px-4 md:text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>

              {formError.specs && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{formError.specs}</p>
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
                          type="text"
                          placeholder="e.g., Performance, Design, Features"
                          className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FCD000] focus:border-transparent transition-colors"
                          value={cat.title}
                          onChange={(e) => handleTitleChange(catIndex, e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(catIndex)}
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
                              type="text"
                              placeholder="e.g., Processor, RAM, Storage"
                              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FCD000] focus:border-transparent transition-colors"
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
                              type="text"
                              placeholder="e.g., Intel Core i7, 16GB, 512GB SSD"
                              className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FCD000] focus:border-transparent transition-colors"
                              value={field.specs_value}
                              onChange={(e) =>
                                handleChange(catIndex, fieldIndex, "specs_value", e.target.value)
                              }
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveField(catIndex, fieldIndex)}
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
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Form Summary</h3>
              
              {/* Progress Bar */}
              <div className="mb-6">
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

              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Product Name</span>
                    {formProductData.product_name ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white break-words">
                    {formProductData.product_name || 'Not specified'}
                  </span>
                </div>

                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Tagline</span>
                    {formProductData.tagline ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span
                    className="block min-w-0 truncate text-sm text-gray-900 dark:text-white"
                    title={formProductData.tagline || 'Not specified'}
                  >
                    {formProductData.tagline || 'Not specified'}
                  </span>
                </div>

                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Description</span>
                    {formProductData.description ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span
                    className="block min-w-0 truncate text-sm text-gray-900 dark:text-white"
                    title={formProductData.description || 'Not specified'}
                  >
                    {formProductData.description || 'Not specified'}
                  </span>
                </div>

                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Category</span>
                    {formProductData.category ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {selectedCategoryLabel}
                  </span>
                </div>

                {/* Quantity summary temporarily hidden. Keep this block for future reactivation.
                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Quantity</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formProductData.quantity}
                  </span>
                </div>
                */}

                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Images</span>
                    {gallery.filter(f => f !== null).length > 0 ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {gallery.filter(f => f !== null).length} uploaded
                  </span>
                </div>

                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Hover Specs</span>
                    {hasCompleteHoverSpecs ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {hoverSpecs.length} spec{hoverSpecs.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Spec Categories</span>
                    {hasCompleteDetailedSpecs ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {specs.length} categor{specs.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
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

              <div className="mt-5 flex gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate('/beesee/ecommerce/product')}
                  disabled={isCreating || isUpdating}
                className="flex min-h-14 flex-1 items-center justify-center rounded-lg border border-gray-300 px-6 py-4 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isCreating || isUpdating}
                  className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-lg bg-[#FCD000] px-6 py-4 text-base font-semibold text-gray-900 shadow-sm transition-colors hover:bg-[#e9c000] disabled:opacity-50"
                >
                  {isCreating || isUpdating ? (
                    <span>{id ? "Updating..." : "Creating..."}</span>
                  ) : (
                    <>
                      <Save className="mr-2 h-[18px] w-[18px] min-[4000px]:h-6 min-[4000px]:w-6" />
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
            <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-center">
              <div>
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${formProductData.product_name ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-gray-600 dark:text-gray-400">Name</span>
              </div>
              <div>
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${formProductData.category ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-gray-600 dark:text-gray-400">Category</span>
              </div>
              <div>
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${gallery.filter(f => f !== null).length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-gray-600 dark:text-gray-400">Images</span>
              </div>
              <div>
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${hasCompleteDetailedSpecs ? 'bg-green-500' : 'bg-gray-300'}`}></div>
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
              <div className="min-h-0 flex-1 overflow-hidden bg-gray-100 p-1.5 dark:bg-gray-950 sm:p-3 md:p-5">
                {mediaPreviewModal.type === "brochure" ? (
                  <PdfPagePreview
                    url={mediaPreviewModal.url}
                    title="Full product brochure preview"
                    className="h-[75dvh] max-h-[75vh] rounded-lg bg-white"
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
