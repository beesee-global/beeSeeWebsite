import React, { useEffect, useMemo, useState } from 'react';
import { 
  Save, 
  Home, 
  SquarePen, 
  Tag,   
  Palette, 
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
} from '../../../services/Ecommerce/categoryServices';
import CustomTextField from '../../../components/Fields/CustomTextField';
import CustomIconPicker from '../../../components/Fields/CustomIconPicker';
import AddImageIcon from '../../../../public/add-image-icon.jpg';
import { AlertColor } from '@mui/material/Alert'; 
import { userAuth } from '../../../hooks/userAuth';
import { 
  useNavigate, 
  useParams 
} from "react-router-dom"; 
import SnackbarTechnician from '../../../components/feedback/SnackbarTechnician';

interface FormCategoryData {
  name: string; 
  icon?: string; 
}

interface FormError {
  name?: string; 
  icon?: string; 
}

const CategoryForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formError, setFormError] = useState<FormError>({});  

  const [formCategoryData, setFormCategoryData] = useState<FormCategoryData>({
    name: '', 
    icon: '', 
  });

  const {
    snackBarMessage, 
    snackBarType, 
    snackBarOpen, 
    setSnackBarMessage,
    setSnackBarType,
    setSnackBarOpen
  } = userAuth()
  
  // ✅ Validation
  const validateForm = (): FormError => {
    const errors: FormError = {};
    if (!formCategoryData.name.trim()) errors.name = 'Category name is required'; 
    if (!formCategoryData.icon) errors.icon = 'Please select an icon'; 
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
  
  // Fetch data only when id exists
  const { data: categoryInfo } = useQuery({
    queryKey: ["category", id],
    queryFn: () => fetchEmployeeByPid(String(id)),
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
        setSnackBarMessage("Please fill in all required fields.");
        return
      };

      const formDataToSend = new FormData();
      Object.entries(formCategoryData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value)
        }
      })  

      if (id) {  
        // pass one object with both id and formData
        await updateCategoryAsync({ id: categoryInfo?.id, categoryData: formDataToSend})
      } else {
        await createCategoryAsync(formDataToSend)
      }
      setSnackBarType('success');
      setSnackBarMessage(id ? 'Category updated successfully!' : 'Category created successfully!');
      navigate('/beesee/ecommerce/category'); 
    } catch (error: any) {
      console.error('❌ Error creating category:', error); 
      setSnackBarType("error");
      setSnackBarMessage("Failed to create category. Please try again.");

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
        setSnackBarOpen(true);  
    }
  };
  
  // When user info arrives, update the form
  useEffect(() => {
    if (categoryInfo) {
      setFormCategoryData({
        name: categoryInfo?.name || "", 
        icon: categoryInfo?.icon, 
      })
    }
  }, [categoryInfo])
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification */} 
        <SnackbarTechnician 
          open={snackBarOpen}
          type={snackBarType}
          message={snackBarMessage}
          onClose={() => setSnackBarOpen(false)}
        />
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[ 
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
          <div className="lg:col-span-3 space-y-8">
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
 
            </form>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;