import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import { useParams } from "react-router-dom";
import { 
  Home, 
  Box, 
  SquarePen, 
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
import ImageCropAdjustDialog from "../../../components/Fields/ImageCropAdjustDialog";
import CustomIconPicker from "../../../components/Fields/CustomIconPicker";
import AddImageIcon from '../../../../public/add-image-icon.jpg';
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

interface FormProductData {
  product_name: string;
  tagline: string;
  description: string;
  category: string;
  quantity: string;
}

interface FormError {
  product_name?: string;
  tagline?: string;
  description?: string;
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
  const [draggedHoverSpecIndex, setDraggedHoverSpecIndex] = useState<number | null>(null);

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

  const handleHoverSpecDrop = (targetIndex: number) => {
    if (draggedHoverSpecIndex === null || draggedHoverSpecIndex === targetIndex) {
      setDraggedHoverSpecIndex(null);
      return;
    }

    setHoverSpecs((previous) => {
      const reordered = [...previous];
      const [draggedSpec] = reordered.splice(draggedHoverSpecIndex, 1);
      reordered.splice(targetIndex, 0, draggedSpec);
      return reordered;
    });
    setDraggedHoverSpecIndex(null);
    setFormError((prev) => ({ ...prev, specs: undefined }));
  };

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
  const [imageToEdit, setImageToEdit] = useState<{ index: number; file: File } | null>(null);
  const [productVideo, setProductVideo] = useState<File | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState("");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [videoSource, setVideoSource] = useState<"upload" | "youtube">("upload");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isRemovingExistingVideo, setIsRemovingExistingVideo] = useState(false);
  const [productBrochure, setProductBrochure] = useState<File | null>(null);
  const [existingBrochureUrl, setExistingBrochureUrl] = useState("");
  const [productSpecsHighlight, setProductSpecsHighlight] = useState<File | null>(null);
  const [existingProductSpecsHighlightUrl, setExistingProductSpecsHighlightUrl] = useState("");
  const [isRemovingProductSpecsHighlight, setIsRemovingProductSpecsHighlight] = useState(false);
  const [isRemovingExistingBrochure, setIsRemovingExistingBrochure] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [brochureEnabled, setBrochureEnabled] = useState(true);
  const [productSpecsHighlightEnabled, setProductSpecsHighlightEnabled] = useState(true);
  const [visibilityUpdating, setVisibilityUpdating] = useState<"video" | "brochure" | "specsHighlight" | null>(null);
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

  const handleVisibilityChange = async (section: "video" | "brochure" | "specsHighlight", enabled: boolean) => {
    const productDatabaseId = productInfo?.id;
    if (!productDatabaseId || visibilityUpdating) {
      if (section === "video") setVideoEnabled(enabled);
      else if (section === "brochure") setBrochureEnabled(enabled);
      else setProductSpecsHighlightEnabled(enabled);
      if (!visibilityUpdating) {
        setSnackBarType("info");
        const label = section === "video" ? "Product video" : section === "brochure" ? "Product brochure" : "Specification highlight image";
        setSnackBarMessage(`${label} will be ${enabled ? "enabled" : "disabled"} when this product is saved.`);
        setSnackBarOpen(true);
      }
      return;
    }

    const field = section === "video" ? "video_enabled" : section === "brochure" ? "brochure_enabled" : "product_specs_highlight_enabled";
    setVisibilityUpdating(section);
    try {
      await updateProductVisibility(productDatabaseId, { [field]: enabled });
      if (section === "video") setVideoEnabled(enabled);
      else if (section === "brochure") setBrochureEnabled(enabled);
      else setProductSpecsHighlightEnabled(enabled);
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      setSnackBarType("success");
      const label = section === "video" ? "Product video" : section === "brochure" ? "Product brochure" : "Specification highlight image";
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

  const handleGalleryChange = (index: number, file: File | null) => {
    if (file) {
      if (!registerFileUpload("image")) return;
      setImageToEdit({ index, file });
      return;
    }
    const newGallery = [...gallery];
    newGallery[index] = null;
    setGallery(newGallery);
  };

  const applyEditedImage = (file: File) => {
    if (!imageToEdit) return;
    setGallery((current) => {
      const next = [...current];
      next[imageToEdit.index] = file;
      return next;
    });
    setImageToEdit(null);
    setFormError((prev) => ({ ...prev, gallery: undefined }));
  };

  const handleAddImage = () => { 
    setGallery([...gallery, null]);
    // clear gallery error when a new slot is added
    setFormError((prev) => ({ ...prev, gallery: undefined })); 
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
    const priceVal = String(formProductData.quantity || '');

    if (!productName.trim()) errors.product_name = "Product name is required.";
    if (!tagline.trim()) errors.tagline = "Tagline is required.";
    if (!description.trim()) errors.description = "Description is required.";
    if (!categoryVal) errors.category = "Category is required.";
    if (!priceVal.trim()) errors.quantity = "Quantity is required.";

    // Validate price is a positive number
    const priceNumber = parseFloat(priceVal);
    if (priceVal && (isNaN(priceNumber) || priceNumber < 0)) {
      errors.quantity = "Quantity must be a positive number."
    }
    
    if (gallery.length === 0) errors.gallery = "Please upload at least one image."
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
      formData.append("quantity", formProductData.quantity);
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
      navigate("/beesee/ecommerce/product");

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Notification */} 
        <Snackbar 
          open={snackBarOpen}
          type={snackBarType}
          message={snackBarMessage}
          onClose={() => setSnackBarOpen(false)}
        />

        {/* Breadcrumb */}
        <div className="mb-4 md:mb-6">
          <Breadcrumb
            items={[ 
              { label: "Product", href: "/beesee/ecommerce/product", icon: <Box className="w-4 h-4" /> },
              { label: "Product Form", isActive: true, icon: <SquarePen className="w-4 h-4" /> },
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                { id ? "Update Product" : "Create New Product" }
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Add a new product to your inventory with detailed specifications
              </p>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <button 
                onClick={() => navigate('/beesee/ecommerce/product')} 
                disabled={isCreating || isUpdating}
                className="flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="flex-1 sm:flex-none flex items-center justify-center px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
              > 
                {isCreating || isUpdating ? (
                  <span>
                    { id ? "Updating..." : "Creating..." }
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    <span className="hidden sm:inline">{ id ? "Update Product" : "Create Product" }</span>
                    <span className="sm:hidden">{ id ? "Update" : "Create" }</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-4 md:space-y-8">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3 md:mr-4">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Essential product details</p>
                </div>
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
                    error={!!formError.category}
                    helperText={formError.category}
                  />
                </div>

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
              </div>
            </div>

            {/* Gallery Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
                <div className="flex items-center">
                  <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3 md:mr-4">
                    <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Product Gallery</h2>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Upload, crop, and adjust product images</p>
                  </div>
                </div> 
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="flex items-center justify-center px-3 md:px-4 py-2 text-sm md:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </button> 
              </div>

              {formError.gallery && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{formError.gallery}</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {gallery.map((item, index) => {
                  let preview = AddImageIcon;
                  if (item instanceof File) {
                    preview = URL.createObjectURL(item);
                  } else if (item && typeof item === "object" && "image_url" in item) {
                    preview = item.image_url;
                  }

                  return (
                    <div
                      key={index}
                      className="relative group border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden hover:border-[#FCD000] transition-colors"
                    >
                      <input 
                        type="file"
                        accept="image/*"
                        id={`gallery-input-${index}`}
                        className="hidden"
                        onChange={(e) => {
                          handleGalleryChange(index, e.target.files?.[0] || null);
                          // Allow the same file to be selected again after cancelling an edit.
                          e.currentTarget.value = "";
                        }}
                      />

                      <label 
                        htmlFor={`gallery-input-${index}`}
                        className="cursor-pointer w-full h-32 sm:h-40 md:h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-center">
                            <Upload className="w-6 md:w-8 h-6 md:h-8 mx-auto mb-2" />
                            <p className="text-xs md:text-sm font-medium">Click to upload</p>
                          </div>
                        </div>
                      </label>
 
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start">
                  <div className="p-2 md:p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg mr-3 md:mr-4">
                    <Video className="w-5 h-5 md:w-6 md:h-6 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Product Video</h2>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Optional. This video is stored in S3 and shown on the public product page.</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 self-start">
                  <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white pl-3 pr-1 text-sm font-bold text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                    <span className={`h-2.5 w-2.5 rounded-full ${videoEnabled ? "bg-emerald-500" : "bg-red-500"}`} />
                    {videoEnabled ? "Active" : "Inactive"}
                    <Switch
                      checked={videoEnabled}
                      onChange={(_, checked) => handleVisibilityChange("video", checked)}
                      disabled={visibilityUpdating === "video"}
                      inputProps={{ "aria-label": "Show product video on the public product page" }}
                      sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#10b981" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#10b981" } }}
                    />
                  </div>
                {(productVideo || existingVideoUrl) && (
                  <button
                    type="button"
                    onClick={productVideo ? () => {
                      setProductVideo(null);
                      setFormError((prev) => ({ ...prev, video: undefined }));
                    } : handleRemoveExistingVideo}
                    disabled={isRemovingExistingVideo}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
                  >
                    <X className="h-4 w-4" />
                    {isRemovingExistingVideo ? "Removing..." : productVideo ? "Clear selection" : "Remove current video"}
                  </button>
                )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Product video source">
                <button
                  type="button"
                  onClick={() => setVideoSource("upload")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${videoSource === "upload" ? "bg-[#FCD000] text-gray-950" : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"}`}
                >
                  Upload video file
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVideoSource("youtube");
                    setProductVideo(null);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${videoSource === "youtube" ? "bg-[#FCD000] text-gray-950" : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"}`}
                >
                  Embed YouTube link
                </button>
              </div>

              {videoSource === "upload" ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
                <label className="flex min-h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-5 text-center transition-colors hover:border-[#FCD000] hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-950/10 dark:hover:bg-amber-950/20">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(event) => {
                      handleVideoChange(event.target.files?.[0] || null);
                      event.currentTarget.value = "";
                    }}
                  />
                  <span>
                    <Upload className="mx-auto mb-2 h-7 w-7 text-amber-700 dark:text-amber-300" />
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{productVideo ? productVideo.name : "Choose a product video"}</span>
                    <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">MP4, WebM, or MOV</span>
                  </span>
                </label>

                {videoPreviewUrl && (
                  <video className="aspect-video w-full rounded-lg border border-gray-200 bg-black object-contain dark:border-gray-700" controls preload="metadata">
                    <source src={videoPreviewUrl} />
                    Your browser does not support video playback.
                  </video>
                )}
              </div>
              ) : (
                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
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
                  {youtubeEmbedUrl && (
                    <iframe
                      className="aspect-video w-full rounded-lg border border-gray-200 bg-black dark:border-gray-700"
                      src={youtubeEmbedUrl}
                      title="YouTube video preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              )}

              {formError.video && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{formError.video}</p>}
            </div>

            {/* Product brochure */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start">
                  <div className="p-2 md:p-3 bg-sky-100 dark:bg-sky-900/20 rounded-lg mr-3 md:mr-4">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-sky-700 dark:text-sky-300" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Product Brochure</h2>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Optional PDF stored in S3. Customers can download it from the product detail page.</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 self-start">
                  <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white pl-3 pr-1 text-sm font-bold text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                    <span className={`h-2.5 w-2.5 rounded-full ${brochureEnabled ? "bg-emerald-500" : "bg-red-500"}`} />
                    {brochureEnabled ? "Active" : "Inactive"}
                    <Switch
                      checked={brochureEnabled}
                      onChange={(_, checked) => handleVisibilityChange("brochure", checked)}
                      disabled={visibilityUpdating === "brochure"}
                      inputProps={{ "aria-label": "Show product brochure download on the public product page" }}
                      sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#10b981" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#10b981" } }}
                    />
                  </div>
                {(productBrochure || existingBrochureUrl) && (
                  <button
                    type="button"
                    onClick={productBrochure ? () => {
                      setProductBrochure(null);
                      setFormError((prev) => ({ ...prev, brochure: undefined }));
                    } : handleRemoveExistingBrochure}
                    disabled={isRemovingExistingBrochure}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
                  >
                    <X className="h-4 w-4" />
                    {isRemovingExistingBrochure ? "Removing..." : productBrochure ? "Clear selection" : "Remove current brochure"}
                  </button>
                )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
                <label className="flex min-h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/50 p-5 text-center transition-colors hover:border-[#FCD000] hover:bg-sky-50 dark:border-sky-800 dark:bg-sky-950/10 dark:hover:bg-sky-950/20">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(event) => {
                      handleBrochureChange(event.target.files?.[0] || null);
                      event.currentTarget.value = "";
                    }}
                  />
                  <span>
                    <FileText className="mx-auto mb-2 h-7 w-7 text-sky-700 dark:text-sky-300" />
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{productBrochure ? productBrochure.name : "Choose a product brochure"}</span>
                    <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">PDF, up to 20 MB</span>
                  </span>
                </label>

                {existingBrochureUrl && !productBrochure && (
                  <a
                    href={existingBrochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-5 text-center text-sm font-semibold text-sky-700 hover:bg-sky-50 dark:border-gray-700 dark:bg-gray-900 dark:text-sky-300 dark:hover:bg-sky-950/30"
                  >
                    <FileText className="mb-2 h-7 w-7" />
                    View current brochure
                  </a>
                )}
              </div>

              {formError.brochure && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{formError.brochure}</p>}
            </div>

            {/* Long product specification highlight image */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex items-start">
                <div className="p-2 md:p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg mr-3 md:mr-4">
                  <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Product Specifications Highlight</h2>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Optional long image displayed after the text specifications on the product detail page.</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white pl-3 pr-1 text-sm font-bold text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                <span className={`h-2.5 w-2.5 rounded-full ${productSpecsHighlightEnabled ? "bg-emerald-500" : "bg-red-500"}`} />
                {productSpecsHighlightEnabled ? "Active" : "Inactive"}
                <Switch
                  checked={productSpecsHighlightEnabled}
                  onChange={(_, checked) => handleVisibilityChange("specsHighlight", checked)}
                  disabled={visibilityUpdating === "specsHighlight"}
                  inputProps={{ "aria-label": "Show product specification highlight image on the public product page" }}
                  sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#10b981" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#10b981" } }}
                />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
                <label className="flex min-h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-5 text-center transition-colors hover:border-[#FCD000] hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-950/10">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      handleProductSpecsHighlightChange(event.target.files?.[0] || null);
                      event.currentTarget.value = "";
                    }}
                  />
                  <span>
                    <ImageIcon className="mx-auto mb-2 h-7 w-7 text-amber-700 dark:text-amber-300" />
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{productSpecsHighlight ? productSpecsHighlight.name : "Choose specification image"}</span>
                    <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">JPG, PNG, WEBP, up to 20 MB</span>
                  </span>
                </label>

                {existingProductSpecsHighlightUrl && !productSpecsHighlight && (
                  <div className="relative flex min-h-32 flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-5 text-center text-sm font-semibold text-amber-700 dark:border-gray-700 dark:bg-gray-900 dark:text-amber-300">
                    <a
                      href={existingProductSpecsHighlightUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center hover:text-amber-800 dark:hover:text-amber-200"
                    >
                      <ImageIcon className="mb-2 h-7 w-7" />
                      View current image
                    </a>
                    <button
                      type="button"
                      onClick={handleRemoveExistingProductSpecsHighlight}
                      disabled={isRemovingProductSpecsHighlight}
                      aria-label="Remove current specification highlight image"
                      title="Remove current image"
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {formError.specsHighlight && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{formError.specsHighlight}</p>}
            </div>

            {/* Quick product highlights shown on the public product-card hover */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="flex items-center">
                  <div className="p-2 md:p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg mr-3 md:mr-4">
                    <Package className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Quick Product Highlights</h2>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">These four ordered details appear on the product-card hover and at the top of the product-detail page.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hoverSpecs.map((h, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => setDraggedHoverSpecIndex(idx)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleHoverSpecDrop(idx)}
                    onDragEnd={() => setDraggedHoverSpecIndex(null)}
                    className={`rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-900/10 ${
                      draggedHoverSpecIndex === idx ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <GripVertical
                          className="h-4 w-4 shrink-0 cursor-grab text-indigo-400 active:cursor-grabbing"
                          aria-label="Drag to reorder highlight"
                        />
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor={`quick-highlight-title-${idx}`}>
                          Highlight title
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveIconPicker(idx)}
                        className="rounded-md border border-indigo-200 bg-white px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-300"
                      >
                        Icon: {h.icon || "Select"}
                      </button>
                    </div>
                    <input
                      id={`quick-highlight-title-${idx}`}
                      type="text"
                      placeholder={`e.g., ${QUICK_HIGHLIGHT_FIELDS[idx].key}`}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-[#FCD000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      value={h.specs_key}
                      onChange={(e) => handleHoverSpecChange(idx, "specs_key", e.target.value)}
                    />
                    <label className="mt-3 block text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor={`quick-highlight-${idx}`}>
                      Highlight value
                    </label>
                    <input
                      id={`quick-highlight-${idx}`}
                      type="text"
                      placeholder={QUICK_HIGHLIGHT_FIELDS[idx].placeholder}
                      className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-[#FCD000] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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

            {/* Specifications Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
                <div className="flex items-center">
                  <div className="p-2 md:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-3 md:mr-4">
                    <Settings className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Specifications</h2>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Add detailed product specifications</p>
                  </div>
                </div>
                <button
                  onClick={handleAddCategory}
                  className="flex items-center justify-center px-3 md:px-4 py-2 text-sm md:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </button>
              </div>

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
                        onClick={() => handleRemoveCategory(catIndex)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors self-end sm:self-auto"
                      >
                        <X className="w-4 h-4" />
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
                            onClick={() => handleRemoveField(catIndex, fieldIndex)}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Form Summary</h3>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completion</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{calculateCompletion()}%</span>
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">Product Name</span>
                    {formProductData.product_name ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white break-words">
                    {formProductData.product_name || 'Not specified'}
                  </span>
                </div>

                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tagline</span>
                    {formProductData.tagline ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white break-words">
                    {formProductData.tagline ? `${formProductData.tagline.slice(0, 50)}${formProductData.tagline.length > 50 ? '...' : ''}` : 'Not specified'}
                  </span>
                </div>

                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Description</span>
                    {formProductData.description ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white break-words">
                    {formProductData.description ? `${formProductData.description.slice(0, 50)}${formProductData.description.length > 50 ? '...' : ''}` : 'Not specified'}
                  </span>
                </div>

                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
                    {formProductData.category ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedCategoryLabel}
                  </span>
                </div>

                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Quantity</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formProductData.quantity}
                  </span>
                </div>

                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Images</span>
                    {gallery.filter(f => f !== null).length > 0 ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {gallery.filter(f => f !== null).length} uploaded
                  </span>
                </div>

                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Hover Specs</span>
                    {hasCompleteHoverSpecs ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {hoverSpecs.length} spec{hoverSpecs.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Spec Categories</span>
                    {hasCompleteDetailedSpecs ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
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
          </div>
        </div>

        <ImageCropAdjustDialog
          file={imageToEdit?.file ?? null}
          onCancel={() => setImageToEdit(null)}
          onApply={applyEditedImage}
        />

        {/* Add padding at bottom for mobile summary */}
        <div className="lg:hidden h-24"></div>
      </div>
    </div>
  );
};

export default ProductForm;
