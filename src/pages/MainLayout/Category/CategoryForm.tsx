import React, { useEffect, useMemo, useState } from 'react';
import { 
  Save, 
  Home, 
  SquarePen, 
  Tag, 
  Upload, 
  CheckCircle, 
  Image as ImageIcon,
  FileText,
  Palette,
  Package
} from 'lucide-react';
import Breadcrumb from '../../../components/Navigation/Breadcrumbs';
import { 
  useMutation, 
  useQuery 
} from '@tanstack/react-query';
import { 
  createCategory, 
  updateCategory,
  fetchEmployeeByPid 
} from '../../../services/categoryServices';
import CustomTextField from '../../../components/Fields/CustomTextField';
import CustomIconPicker from '../../../components/Fields/CustomIconPicker';
import AddImageIcon from '../../../assets/images/add-image-icon.jpg';
import { AlertColor } from '@mui/material/Alert';
import Snackbar from '../../../components/feedback/Snackbar'; 
import { 
  useNavigate, 
  useParams 
} from "react-router-dom"; 

interface FormCategoryData {
  name: string;
  tagline: string;
  icon?: string;
  image?: File | null;
}

interface FormError {
  name?: string;
  tagline?: string;
  icon?: string;
  image?: string;
}

const CategoryForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formError, setFormError] = useState<FormError>({});
  const [message, setMessage] = useState("");
  const [snackBarType, setSnackBarType] = useState<AlertColor>("success")
  const [showAlert, setShowAlert] = useState<boolean>(false)   

  const [formCategoryData, setFormCategoryData] = useState<FormCategoryData>({
    name: '',
    tagline: '',
    icon: '',
    image: null,
  });
  
  // ✅ Validation
  const validateForm = (): FormError => {
    const errors: FormError = {};
    if (!formCategoryData.name.trim()) errors.name = 'Category name is required';
    if (!formCategoryData.tagline.trim()) errors.tagline = 'Tagline is required';
    if (!formCategoryData.icon) errors.icon = 'Please select an icon';
    if (!formCategoryData.image) {
      errors.image = 'Please upload an image';
    } else {
      if (formCategoryData.image instanceof File) {
        const imageSizeMB = formCategoryData.image.size / 1024 / 1024;
        if (imageSizeMB.toFixed(2) == "10") {
          errors.image = "Maximum file size is 10 MB"
        }
      }
    }
    return errors;
  };

  // ✅ Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormCategoryData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));

    setFormError((prev) => ({
      ...prev,
      [name]: undefined
    }))
  };

  const handleImageChange = (file: File | null) => {
    setFormCategoryData((prev) => ({ 
      ...prev, 
      image: file 
    }));
    
    // Clear image error when file is selected
    if (file) {
      setFormError((prev) => ({
        ...prev,
        image: undefined
      }));
    }
  };

  // Fetch data only when id exists
  const { data: categoryInfo } = useQuery({
    queryKey: ["category", id],
    queryFn: () => fetchEmployeeByPid(id),
    enabled: !!id // only fetch when id is defined
  })

  // ✅ Mutation for creating category
  const {
    mutateAsync: createCategoryAsync,
    isPending : isCreating,
  } = useMutation({
    mutationFn: createCategory,
  });

  // ✅ Mutation for updating category
  const {
    mutateAsync: updateCategoryAsync,
    isPending: isUpdating
  } = useMutation({
    mutationFn: updateCategory
  })

  // ✅ Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const errors = validateForm();
      setFormError(errors);
      if (Object.keys(errors).length > 0) {
        setSnackBarType("error")
        setMessage("Please fill in all required fields.");
        return
      };

      const formDataToSend = new FormData();
      Object.entries(formCategoryData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value)
        }
      }) 
      console.log("error", formCategoryData)

      if (id) {
        // remove image if not changed
        if (typeof formCategoryData.image === "string") {
          formDataToSend.delete("image")
        }

        // pass one object with both id and formData
        await updateCategoryAsync({ id: categoryInfo.id, categoryData: formDataToSend})
      } else {
        await createCategoryAsync(formDataToSend)
      }
      setSnackBarType('success');
      setMessage(id ? 'Category updated successfully!' : 'Category created successfully!');
 
      setTimeout(() => navigate('/beesee/category'), 2000); 
    } catch (error: any) {
      console.error('❌ Error creating category:', error); 
      setSnackBarType("error");
      setMessage("Failed to create category. Please try again.");

      if (error.response?.status === 400) {
        const message = error.response.data?.message;
        if (message === "Category name already exists") {
          setFormError((prev) => ({
            ...prev,
            name: message
          }))
        }  
      }
    } finally { 
        setShowAlert(true);  
    }
  };

  // Memoized preview (perfect as you wrote)
  const preview = useMemo(() => {
    if (formCategoryData.image instanceof File) {
      return URL.createObjectURL(formCategoryData.image)
    } else if (typeof formCategoryData.image === "string" && formCategoryData.image.trim() !== "") {
      return formCategoryData.image;
    } else{
      return AddImageIcon;
    }
  }, [formCategoryData.image])

  // When user info arrives, update the form
  useEffect(() => {
    if (categoryInfo) {
      setFormCategoryData({
        name: categoryInfo.name || "",
        tagline: categoryInfo.tagline || "",
        icon: categoryInfo.icon,
        image: categoryInfo.image || ""
      })
    }
  }, [categoryInfo])

  // Cleanup blob URLs if a File is selected
  useEffect(() => {
    let objectUrl: string | undefined;

    if (formCategoryData.image instanceof File) {
      objectUrl = URL.createObjectURL(formCategoryData.image)
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [formCategoryData.image])

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
              { label: 'Home', href: '/beesee/dashboard', icon: <Home className="w-4 h-4" /> },
              { label: 'Category', href: '/beesee/category', icon: <Tag className="w-4 h-4" /> },
              { label: 'Category Form', isActive: true, icon: <SquarePen className="w-4 h-4" /> },
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                { id ? "Update Category" : "Create New Category"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add a new category to organize your products
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/beesee/category')} 
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
                    { id ? "Update Category" : "Create Category" }
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-4">
                    <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Essential category details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Name *
                    </label>
                    <CustomTextField
                      name="name"
                      placeholder="Enter category name"
                      value={formCategoryData.name}
                      multiline={false}
                      rows={1}
                      type="text"
                      maxLength={100}
                      onChange={handleInputChange}
                      error={!!formError.name}
                      helperText={formError.name}
                      icon={<Tag className="w-4 h-4" />}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tagline  *
                    </label>
                    <CustomTextField
                      name="tagline"
                      placeholder="Brief tagline of the category"
                      value={formCategoryData.tagline}
                      multiline={true}
                      rows={3}
                      type="text"
                      maxLength={150}
                      onChange={handleInputChange}
                      error={!!formError.tagline}
                      helperText={formError.tagline}
                      icon={<FileText className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </div>

              {/* Icon Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg mr-4">
                    <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Icon Selection</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Choose an icon for your category</p>
                  </div>
                </div>

                <div>
                  <CustomIconPicker
                    value={formCategoryData.icon}
                    onChange={(iconName) => {
                      setFormCategoryData((prev) => ({ ...prev, icon: iconName }));
                      setFormError((prev) => ({ ...prev, icon: undefined }));
                    }}
                    label="Select Icon"
                    error={formError.icon}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg mr-4">
                    <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Category Image</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Upload a representative image</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      id="image-upload"
                      className="hidden"
                      onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                    />

                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer block w-full"
                    >
                      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden hover:border-[#FCD000] transition-colors group">
                        <div className="aspect-video bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                          <img
                            src={preview}
                            alt="Preview"
                            className="object-cover w-full h-full"
                          />
                        </div>

                        {/* Upload overlay for empty state */}
                        {!formCategoryData.image && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90">
                            <Upload className="w-12 h-12 text-[#FCD000] mb-3" />
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">Click to upload image</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">PNG, JPG up to 10MB</p>
                          </div>
                        )}

                        {/* Change image overlay */}
                        {formCategoryData.image && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-white text-center">
                              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                              <p className="font-medium">Change Image</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* File info */}
                  {formCategoryData.image && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <ImageIcon className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formCategoryData.image.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {(formCategoryData.image.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}

                  {/* Error message */}
                  {formError.image && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-600 dark:text-red-400 text-sm">{formError.image}</p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Form Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Category Name:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formCategoryData.name || 'Not specified'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tagline:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formCategoryData.tagline ? 'Added' : 'Not specified'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Icon:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formCategoryData.icon ? 'Selected' : 'Not selected'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Image:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formCategoryData.image ? 'Uploaded' : 'Not uploaded'}
                  </span>
                </div>
              </div>

{/*               <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${formCategoryData.category ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-600 dark:text-gray-400">Category name</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${formCategoryData.tagline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-600 dark:text-gray-400">Tagline</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${formCategoryData.icon ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-600 dark:text-gray-400">Icon selected</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${formCategoryData.image ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-600 dark:text-gray-400">Image uploaded</span>
                  </div>
                </div>
              </div> */}

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Form Status</div>
                  <div className={`text-sm font-medium ${
                    formCategoryData.category && formCategoryData.tagline && formCategoryData.icon && formCategoryData.image
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {formCategoryData.category && formCategoryData.tagline && formCategoryData.icon && formCategoryData.image
                      ? 'Ready to create'
                      : 'Incomplete'
                    }
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;