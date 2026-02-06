import React, { useEffect, useState } from "react";
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
  Settings,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomTextField from "../../../components/Fields/CustomTextField";
import CustomSelectField from "../../../components/Fields/CustomSelectField";
import AddImageIcon from '../../../../public/add-image-icon.jpg';
import CustomIconPicker from "../../../components/Fields/CustomIconPicker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  createProduct, 
  fetchCategory, 
  fetchSpecificProduct, 
  updateProduct 
} from '../../../services/Ecommerce/productServices'
import Snackbar from '../../../components/feedback/Snackbar'; 
import { AlertColor } from '@mui/material/Alert';
import { userAuth } from "../../../hooks/userAuth";
import Product from "../../TechnicianPage/Product/Product";

interface FormProductData {
  product_name: string;
  tagline: string;
  description: string;
  category: number;
  quantity: string;
}

interface FormError {
  product_name?: string;
  tagline?: string;
  description?: string;
  category?: string;
  quantity?: string;
  gallery?: string;
  specs?: string;
}

type GalleryItem = 
  | { image_id: number; image_url: string }  // existing DB image
  | File                                     // new uploaded image
  | null;                                    // empty slot

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
    category: 0,
    quantity: "0"
  });

  // --- Hover specs (flat key/value/icon) ---
  const [hoverSpecs, setHoverSpecs] = useState<{
    specs_key: string;
    specs_value: string;
    icon?: string;
  }[]>([]);

  const handleAddHoverSpec = () => {
    if (hoverSpecs.length >= 4) {
      setSnackBarType("error");
      setSnackBarMessage("You can only add up to 4 hover specs.");
      setSnackBarOpen(true);
      return;
    }
    setHoverSpecs((prev) => [...prev, { specs_key: "", specs_value: "", icon: "" }]);
  };

  const handleRemoveHoverSpec = (index: number) => {
    setHoverSpecs((prev) => prev.filter((_, i) => i !== index));
  };

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

  const handleGalleryChange = (index: number, file: File | null) => {
    const newGallery = [...gallery];
    newGallery[index] = file ? file : null; // replace existing with new file
    setGallery(newGallery);
    // clear gallery error when user adds/changes an image
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
          if (key.trim() === "" || val.trim() === "") {
            errors.specs = `In "${catTitle || `Category ${i + 1}`}", field ${j + 1} has an empty key or value.`;
            break;
          }
        }

        if (errors.specs) break; // stop checking other category once we find an error
      }
    }

    // Validate hoverSpecs entries if any
    for (let h = 0; h < hoverSpecs.length; h++) {
      const hs = hoverSpecs[h];
      const k = String(hs.specs_key || "").trim();
      const v = String(hs.specs_value || "").trim();
      if (!k || !v) {
        errors.specs = `Hover spec ${h + 1} must have both key and value.`;
        break;
      }
    }

    return errors
  }

  // ✅ Mutation for creating product
  const {
    mutateAsync: createProductAsync,
    isPending: isCreating,
  } = useMutation({
    mutationFn: createProduct
  })
  
  /* updating data */
  const {
    mutateAsync: updateProductAsync,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: updateProduct,
  });
  

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
          if (f.specs_key) detailedSpecsObj[title][f.specs_key] = f.specs_value;
        });
      });
      formData.append("detailedSpecs", JSON.stringify(detailedSpecsObj));

      // 4️⃣ Convert all gallery images (existing + new) to Files
      const galleryFiles: File[] = [];

      const getFileFromUrl = async (url: string, filename: string) => {
        const res = await fetch(url);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
      };

      for (const item of gallery) {
        if (item instanceof File) {
          galleryFiles.push(item); // new uploaded file
        } else if (item && typeof item === "object" && "image_url" in item) {
          // existing image from DB → convert to File
          const fileFromUrl = await getFileFromUrl(item.image_url, `image_${item.image_id}.jpg`);
          galleryFiles.push(fileFromUrl);
        }
      }

      galleryFiles.forEach((file, idx) => {
        formData.append(`gallery[${idx}]`, file);
      });

      // 5️⃣ Call mutation
      if (id) {   
        const selectedOption = category.find(cat => cat.label === formProductData.category);
        const selectedOptionId = category.find(cat => cat.value === formProductData.category);
        formData.append("category_id", selectedOption?.value || selectedOptionId?.value);
        await updateProductAsync({
          id: productInfo.id,
          productData: formData
        });
      } else { 
        formData.append("category_id", String(formProductData.category)); 
        await createProductAsync(formData);
      }

      // 6️⃣ Success feedback
      setSnackBarType("success");
      setSnackBarMessage(id ? "Product updated successfully!" : "Product created successfully!");
      setSnackBarOpen(true);
      navigate("/beesee/ecommerce/product");

    } catch (error: any) {
      console.error("❌ Error uploading product:", error);

      // Optional: handle specific API errors
      if (error.response?.status === 400) {
        const message = error.response.data?.message;
        if (message === "Name already exists.") {
          setFormError((prev) => ({ ...prev, product_name: message }));
        }
        if (message === "Tagline already exists.") {
          setFormError((prev) => ({ ...prev, tagline: message }));
        }
      }

      setSnackBarType("error");
      setSnackBarMessage("Failed to upload product. Please try again.");
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
        value: item.id,   // ✅ foreign key (number)
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
    console.log("display product", productInfo)
    if (productInfo) {
      setProductData({
        product_name: productInfo?.name || "",
        tagline: productInfo?.tagline || "",
        description: productInfo?.description || "",
        category: productInfo?.category_id || "",
        quantity: String(productInfo?.quantity || "0")
      });

      // Gallery
      const initialGallery = (productInfo.images || []).map((img: any, index: number) => ({
        image_id: img.image_id ?? index,
        image_url: img.image_url
      }));
      setGallery(initialGallery);

      // Detailed Specs
      const formattedSpecs = Object.entries(productInfo.detailed_specs || {}).map(
        ([title, fieldsObj]) => ({
          title,
          fields: Object.entries(fieldsObj).map(([key, value]) => ({
            specs_key: key,
            specs_value: value
          }))
        })
      );
      setSpecs(formattedSpecs);

      // Hover Specs
      const initialHover = (productInfo.hover_specs || []).map((h: any) => ({
        specs_key: h.key,
        specs_value: h.value,
        icon: h.icon || ''
      }));
      setHoverSpecs(initialHover);
    }
  }, [productInfo]);

  // Calculate form completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    const total = 7; // Total checkpoints

    if (formProductData.product_name.trim()) completed++;
    if (formProductData.tagline.trim()) completed++;
    if (formProductData.description.trim()) completed++;
    if (formProductData.category) completed++;
    if (formProductData.quantity) completed++;
    if (gallery.filter(f => f !== null).length > 0) completed++;
    if (specs.length > 0) completed++;

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
              { label: "Product", href: "/beesee/product", icon: <Box className="w-4 h-4" /> },
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
                onClick={() => navigate('/beesee/product')} 
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
                        name="price"
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
                  {formError.quantity && <p className="text-red-600 text-sm mt-1">{formError.price}</p>}
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
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Upload product images</p>
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
                        onChange={(e) => 
                          handleGalleryChange(index, e.target.files?.[0] || null)
                        }
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

            {/* Hover Product Specs Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
                <div className="flex items-center">
                  <div className="p-2 md:p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg mr-3 md:mr-4">
                    <Package className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Hover Product Specs</h2>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Quick specs shown on product card hover</p>
                  </div>
                </div>
                <button
                  onClick={handleAddHoverSpec}
                  className="flex items-center justify-center px-3 md:px-4 py-2 text-sm md:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Spec
                </button>
              </div>

              {hoverSpecs.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm italic text-center py-4">No hover specs added yet. Click "Add Spec" to get started.</p>
              )}

              <div className="space-y-3">
                {hoverSpecs.map((h, idx) => (
                  <div key={idx} className="flex flex-col gap-2 md:gap-3 items-stretch bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <div className="flex gap-2">
                      <div className="space-y-3">
                        <div className="flex-1">
                          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key</label>
                          <input
                            type="text"
                            placeholder="e.g., cpu, ram"
                            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={h.specs_key}
                            onChange={(e) => handleHoverSpecChange(idx, 'specs_key', e.target.value)}
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
                          <input
                            type="text"
                            placeholder="e.g., Intel i5, 16GB"
                            className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={h.specs_value}
                            onChange={(e) => handleHoverSpecChange(idx, 'specs_value', e.target.value)}
                          />
                        </div>

                        <div className="w-full">
                          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                          <CustomIconPicker
                            value={h.icon}
                            onChange={(iconName) => handleHoverSpecChange(idx, 'icon', iconName)}
                            label="Select Icon"
                          />
                        </div> 
                      </div>
                      <div>
                        <button 
                          onClick={() => handleRemoveHoverSpec(idx)} 
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                    {hoverSpecs.length > 0 ? (
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
                    {specs.length > 0 ? (
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
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${specs.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-gray-600 dark:text-gray-400">Specs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add padding at bottom for mobile summary */}
        <div className="lg:hidden h-24"></div>
      </div>
    </div>
  );
};

export default ProductForm;