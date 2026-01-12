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
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomTextField from "../../../components/Fields/CustomTextField";
import CustomSelectField from "../../../components/Fields/CustomSelectField";
import AddImageIcon from '../../../../public/add-image-icon.jpg';
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  createProduct, 
  fetchCategory, 
  fetchSpecificProduct, 
  updateProduct 
} from '../../../services/Ecommerce/productServices'
import Snackbar from '../../../components/feedback/Snackbar'; 
import { AlertColor } from '@mui/material/Alert';

interface FormProductData {
  product_name: string;
  tagline: string;
  category: number;
  stock: string;
}

interface FormError {
  product_name?: string;
  tagline?: string;
  category?: string;
  stock?: string;
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

  const [message, setMessage] = useState("");
  const [snackBarType, setSnackBarType] = useState<AlertColor>("success")
  const [showAlert, setShowAlert] = useState<boolean>(false) 

  // --- Basic Info ---
  const [formProductData, setProductData] = useState<FormProductData>({
    product_name: "",
    tagline: "",
    category: 0,
    stock: "0"
  });

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
    if (gallery.length < 3) {
      setGallery([...gallery, null]);
      // clear gallery error when a new slot is added
      setFormError((prev) => ({ ...prev, gallery: undefined }));
    }
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
    const categoryVal = formProductData.category;
    const stockVal = String(formProductData.stock || '');

    if (!productName.trim()) errors.product_name = "Product name is required.";
    if (!tagline.trim()) errors.tagline = "Tagline is required.";
    if (!categoryVal) errors.category = "Category is required.";
    if (!stockVal.trim()) errors.stock = "Stock quantity is required.";

    // Validate stock is a positive number
    const stockNumber = parseInt(stockVal);
    if (stockVal && (isNaN(stockNumber) || stockNumber < 0)) {
      errors.stock = "Stock must be a positive number."
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
      const errors = validateForm();
      setFormError(errors)
      if (Object.keys(errors).length > 0) {
        setSnackBarType("error")
        setMessage("Please fill in all required fields.")
        setShowAlert(true);
        return; // stop submission when validation fails
      }

      // ✅ Use FormData to send file + text data
      const formData = new FormData(); 

      formData.append("name", formProductData.product_name);
      formData.append("tagline", formProductData.tagline);
      formData.append("category_id", String(formProductData.category));
      formData.append("stock", formProductData.stock);

      // ✅ Append specs (convert object → JSON string)
      formData.append("specification", JSON.stringify(specs));

      if (id) {
        const keptImages = gallery
          .filter((item) => typeof item === 'object' && !(item instanceof File ) && item !== null)
          .map((img: any) => img.image_id);

        // ✅ Only append new files, ignore existing image URLs
        gallery.forEach((item) => {
          if (item instanceof File) {
            formData.append("new_images", item);
          }
        }); 
        
        // ✅ Append kept and removed images
        formData.append("kept_images", JSON.stringify(keptImages));
        formData.append("removed_images", JSON.stringify(removedImages));

        // update product logic here
        await updateProductAsync({ id: productInfo.id, productData: formData})
      } else {
          // ✅ Only append new files, ignore existing image URLs
        gallery.forEach((item) => {
          if (item instanceof File) {
            formData.append("image", item);
          }
        });
        await createProductAsync(formData)
      }

      setSnackBarType('success');
      setMessage(id ? 'Product updated successfully!' : 'Product created successfully!');
      setTimeout(() => navigate('/beesee/product'), 2000);  
    } catch (error: any) {
      console.log('Error', error)
      if (error.response?.status === 400) {
        const message = error.response.data?.message;
        console.log(  message)
        if (message == "Name already exists.") {
          setFormError((prev) => ({
            ...prev,
            product_name: message
          }))
        }

        if (message == "Tagline already exists.") {
          setFormError((prev) => ({
            ...prev,
            tagline: message
          }))
        }

      }
      console.error('❌ Error creating product:', error); 
      setSnackBarType("error");
      setMessage("Failed to upload product. Please try again.");
    } finally {
      setShowAlert(true)
    }
  }

  // --- fetch all category ---
  const {
    data: category = []
  } = useQuery({
    queryKey: ['category'],
    queryFn: () => fetchCategory(),
    select: (data) => {
      // map api result into label/value pairs
         // map API result into label/value pairs
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
    if (productInfo) {
      setProductData({
        product_name: productInfo.name || "",
        tagline: productInfo.tagline || "",
        category: productInfo.category_id || 0,
        stock: String(productInfo.stock || "0")
      });

      const initialGallery = (productInfo.images || []).map((img: any) => ({
        image_id : img.image_id,
        image_url: img.image_url
      }));
      setGallery(initialGallery); // ✅ always an array

      const formattedSpecs = (productInfo.categories || []).map((category: any) => ({
        title: category.title,
        category_id: category.category_id,
        fields: (category.specs || []).map((spec: any) => ({
          spec_id: spec.spec_id,
          specs_key: spec.specs_key,
          specs_value: spec.specs_value,
        })),
      }));

      setSpecs(formattedSpecs);
    }
  }, [productInfo]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification */} 
        <Snackbar 
          open={showAlert}
          type={snackBarType}
          message={message}
          onClose={() => setShowAlert(false)}
        />

        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/beesee/dashboard", icon: <Home className="w-4 h-4" /> },
              { label: "Product", href: "/beesee/product", icon: <Box className="w-4 h-4" /> },
              { label: "Product Form", isActive: true, icon: <SquarePen className="w-4 h-4" /> },
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                { id ? "Update Product" : "Create New Product" }
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add a new product to your inventory with detailed specifications
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/beesee/product')} 
                disabled={isCreating || isUpdating}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
              > 
                {isCreating || isUpdating ? (
                  <span>
                    { id ? "Updating..." : "Creating..." }
                  </span>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                     { id ? "Update Product" : "Create Product" }
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-4">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Essential product details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="Brief description of the product"
                    value={formProductData.tagline}
                    multiline={true}
                    rows={3}
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

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Quantity *
                  </label>
                  <CustomTextField 
                    name="stock"
                    placeholder="Enter quantity"
                    value={formProductData.stock}
                    multiline={false}
                    rows={1}
                    type="number"
                    maxLength={10} 
                    onChange={handleInputChange}  
                    error={!!formError.stock}
                    helperText={formError.stock}
                    icon={<Hash className="w-4 h-4" />}
                  /> 
                </div> */}
              </div>
            </div>

            {/* Gallery Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg mr-4">
                    <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Product Gallery</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Upload up to 3 product images</p>
                  </div>
                </div>
                {gallery.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                  </button>
                )}
              </div>

              {formError.gallery && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{formError.gallery}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        className="cursor-pointer w-full h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm font-medium">Click to upload</p>
                          </div>
                        </div>
                      </label>
 
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Specifications Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-4">
                    <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Specifications</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Add detailed product specifications</p>
                  </div>
                </div>
                <button
                  onClick={handleAddCategory}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

              <div className="space-y-6">
                {specs.map((cat, catIndex) => (
                  <div
                    key={catIndex}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 mr-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Performance, Design, Features"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FCD000] focus:border-transparent transition-colors"
                          value={cat.title}
                          onChange={(e) => handleTitleChange(catIndex, e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveCategory(catIndex)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Fields */}
                    <div className="space-y-3">
                      {cat.fields.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-4">
                          No fields added yet. Click "Add Field" to get started.
                        </p>
                      )}

                      {cat.fields.map((field, fieldIndex) => (
                        <div
                          key={fieldIndex}
                          className="flex gap-3 items-end"
                        >
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Key
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Processor, RAM, Storage"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FCD000] focus:border-transparent transition-colors"
                              value={field.specs_key}
                              onChange={(e) =>
                                handleChange(catIndex, fieldIndex, "specs_key", e.target.value)
                              }
                            />
                          </div>

                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Value
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Intel Core i7, 16GB, 512GB SSD"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FCD000] focus:border-transparent transition-colors"
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

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Form Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Product Name:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formProductData.product_name || 'Not specified'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedCategoryLabel || 'Not selected'}
                  </span>
                </div>

                {/* <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stock:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formProductData.stock || 'Not specified'}
                  </span>
                </div> */}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Images:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {gallery.filter(f => f !== null).length}/3
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Specs category:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {specs.length}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  All required fields completed
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;