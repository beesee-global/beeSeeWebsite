import React, { useEffect, useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom" 
import CustomTextField from "../../../components/Fields/CustomTextField"
import CustomSelectField from "../../../components/Fields/CustomSelectField"
import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import { AlertColor } from "@mui/material"
import { useMutation, useQuery } from "@tanstack/react-query" 
import { createEmployee, fetchEmployeeByPid, updateEmployee } from '../../../services/Ecommerce/employeeServices'
import Snackbar from "../../../components/feedback/Snackbar"
import { 
  Home,
  User2,
  Save,
  Lock,
  Image as ImageIcon,
  MapPin,
  X,
  Upload,
  CheckCircle,
  Key,
} from "lucide-react"
import { Email } from "@mui/icons-material"
import AddImageIcon from '../../../../public/add-image-icon.jpg';

interface EmployeeFormProps {
  first_name: string,
  last_name: string,
  email: string,
  phone: string;
  password?: string;
  confirm_password?: string;
  address: string;
  role: string;
  status?: string;
  image?: File | string | null
}

interface FormError {
  first_name?: string,
  last_name?: string,
  email?: string,
  phone?: string;
  password?: string;
  confirm_password?: string;
  address?: string;
  role?: string;
  image?: string;
}

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  /* Snackbar */
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success")

  /* FormError */
  const [formError, setFormError] = useState<FormError>({})

  const [formData, setFormData] = useState<EmployeeFormProps>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    role: "",
    status: "Active",
    address: "",
  }); 

  const validateForm = (): FormError => {
    const errors: FormError = {};
    if (!formData.first_name.trim()) errors.first_name = "First name is required";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) errors.phone = "Phone number is required.";

    const password = formData.password ?? "";

    if (!id) {
      if (!password) {
        errors.password = "Password is required";
      } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters long.";
      } else if (!/[A-Z]/.test(password)) {
        errors.password = "Password must contain at least one uppercase letter.";
      } else if (!/[a-z]/.test(password)) {
        errors.password = "Password must contain at least one lowercase letter.";
      } else if (!/[0-9]/.test(password)) {
        errors.password = "Password must contain at least one number.";
      } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
        errors.password = "Password must contain at least one special character.";
      }
    } else {
      if (password && password.length < 8) {
        errors.password = "Password must be at least 8 characters long.";
      } else if (password && !/[A-Z]/.test(password)) {
        errors.password = "Password must contain at least one uppercase letter.";
      } else if (password && !/[a-z]/.test(password)) {
        errors.password = "Password must contain at least one lowercase letter.";
      } else if (password && !/[0-9]/.test(password)) {
        errors.password = "Password must contain at least one number.";
      } else if (password && !/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
        errors.password = "Password must contain at least one special character.";
      }
    }

    if (formData.confirm_password !== formData.password) errors.confirm_password = "Confirm passwords do not match"; 
    if (!formData.role) errors.role = "Position is required."
    if (!formData.address) errors.address = "Address is required."
    if (!formData.image) { 
      errors.image = "Please upload an image"
    } else {
      if (formData.image instanceof File) {
        const imageSizeMB = formData.image.size / 1024 / 1024;
        if (imageSizeMB.toFixed(2) == "10") {
          errors.image = "Maximum file size is 10 MB"
        }
      }
    }

    return errors;
  }

  // ✅ 2. Fetch data only when id exists
  const { data: userInfo } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployeeByPid(id),
    enabled: !!id, // ✅ only fetch when id is defined
  });

  /* inserting data */
  const {
    mutateAsync: createEmployeeMutate,
    isPending: isCreating,
  } = useMutation({
    mutationFn: createEmployee,
  });

  /* updating data */
  const {
    mutateAsync: updateEmployeeMutate,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: updateEmployee,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const errors = validateForm();
      setFormError(errors);

      if (Object.keys(errors).length > 0) {
        setSnackbarSeverity("error")
        setSnackbarMessage("Please fill in all required fields")
        return
      }

      // Prepare FormData for sending
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value)
        }
      });

      // When updating (edit mode)

      if (id) {
        if (!formData.password) {
          formDataToSend.delete("password");
          formDataToSend.delete("confirm_password");
        } 

        // 2️⃣ Remove image if it’s not changed (still URL string)
        if (typeof formData.image === "string") {
          formDataToSend.delete("image");
        }

        // ✅ Option 2 — pass one object with both id and formData
        await updateEmployeeMutate({ id: userInfo.id, employeeData: formDataToSend });
      } else {
        await createEmployeeMutate(formDataToSend);
      }
      setTimeout(() => navigate('/beesee/employee'), 2000);  
    } catch (error: any){
      // check if its an axios error
      if (error.response?.status === 400) {
        const message = error.response.data?.message;

        // handle specific backend validation
        if (message === "Email already exists.") {
          setFormError((prev) => ({
            ...prev,
            email: message, // show inline email error
          })); 
        }
      }

      console.error('❌ Error creating category:', error); 
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to create employee. Please try again.");
    } finally {
      setSnackbarOpen(true)
    }
  }

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement >) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name] : value
    }));

    setFormError((prev) => ({
      ...prev,
      [name]: undefined
    }))
  }

  const handleImageChange = (file: File | null) => {
    setFormData((prev) => ({ 
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

  // ✅ 1. Memoized preview (perfect as you wrote)
  const preview = useMemo(() => {
    if (formData.image instanceof File) {
      return URL.createObjectURL(formData.image);
    } else if (typeof formData.image === "string" && formData.image.trim() !== "") {
      return formData.image;
    } else {
      return AddImageIcon;
    }
  }, [formData.image]);

  // ✅ 3. When user info arrives, update the form
  useEffect(() => {
    if (userInfo) {
      // update all form fields, including image URL
      setFormData({
        first_name: userInfo.first_name || "",
        last_name: userInfo.last_name || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        address: userInfo.address || "",
        role: userInfo.role || "",
        status: userInfo.status || "Active",
        password: "",
        confirm_password: "",
        image: userInfo.image || "", // ✅ store URL string, not File
      });
    }
  }, [userInfo]);

  // ✅ 4. Cleanup blob URLs if a File is selected
  useEffect(() => {
    let objectUrl: string | undefined;

    if (formData.image instanceof File) {
      objectUrl = URL.createObjectURL(formData.image);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [formData.image]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification */}
        <Snackbar 
          open={snackbarOpen}
          type={snackbarSeverity}
          message={snackbarMessage}
          onClose={() => setSnackbarOpen(false)}
        /> 

        <div className="mb-6">
          {/* Breadcrumbs */}
          <Breadcrumb 
            items={[
              { label: "Home", href: "/beesee/dashboard", icon: <Home className="w-4 h-4"/> },
              { label: "Employee", isActive: true, icon: <User2 className="w-4 h-4"/> }
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                { id ? "Update Employee" : "Create New Employee" }
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                { id ? "Update a employee " : "Add a new employee " } 
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/beesee/employee')} 
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
                    { id ? "Update Employee" : "Create Employee" }
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left columns - form */}
            <div className="lg:col-span-2 space-y-8">
              <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-4">
                      <User2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                      <p className="text-gray-600 dark:text-gray-400">Essential employee details</p>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="space-y-6">
                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Position *
                      </label>
                      <CustomSelectField
                        name="role"
                        placeholder="Select Position"
                        value={formData.role}
                        onChange={handleChangeInput}
                        options={[
                          { value: '', label: 'Select Position' },
                          { value: 'technician', label: 'Technician' }, 
                          { value: 'admin', label: 'Admin' }, 
                        ]}
                        error={!!formError.role}
                        helperText={formError.role}
                      />
                    </div>
                    
                    {/* First name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <CustomTextField 
                        name="first_name"
                        placeholder="Enter first name"
                        value={formData.first_name}
                        onChange={handleChangeInput}
                        maxLength={100}
                        rows={1}
                        multiline={false}
                        type="text"
                        helperText={formError.first_name}
                        error={!!formError.first_name}
                        icon={<User2 className="w-4 h-4" />}
                      />
                    </div>

                    {/* Last name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <CustomTextField 
                        name="last_name"
                        placeholder="Enter last name"
                        value={formData.last_name}
                        onChange={handleChangeInput}
                        maxLength={100}
                        rows={1}
                        multiline={false}
                        type="text"
                        helperText={formError.last_name}
                        error={!!formError.last_name}
                        icon={<User2 className="w-4 h-4" />}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <CustomTextField 
                        name="email"
                        disabled={id && true}
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChangeInput}
                        maxLength={100}
                        rows={1}
                        multiline={false}
                        type="email"
                        helperText={formError.email}
                        error={!!formError.email}
                        icon={<Email className="w-4 h-4" />}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password *
                      </label>
                      <CustomTextField 
                        name="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChangeInput}
                        maxLength={100}
                        rows={1}
                        multiline={false}
                        type="password"
                        helperText={formError.password}
                        error={!!formError.password}
                        icon={<Lock className="w-4 h-4" />}
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password *
                      </label>
                      <CustomTextField 
                        name="confirm_password"
                        placeholder="Enter confirm password"
                        value={formData.confirm_password}
                        onChange={handleChangeInput}
                        maxLength={100}
                        rows={1}
                        multiline={false}
                        type="password"
                        helperText={formError.confirm_password}
                        error={!!formError.confirm_password}
                        icon={<Lock className="w-4 h-4" />}
                      />
                    </div>

                    {/* Phone */} 
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone *
                      </label>
                      <CustomTextField 
                        name="phone"
                        placeholder="Enter contact number"
                        value={formData.phone}
                        onChange={handleChangeInput}
                        maxLength={11}
                        rows={1}
                        multiline={false}
                        type="tel"
                        helperText={formError.phone}
                        error={!!formError.phone}
                        icon={<Lock className="w-4 h-4" />}
                      />
                    </div>

                    {/* address */} 
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address *
                      </label>
                      <CustomTextField 
                        name="address"
                        placeholder="Enter your complete address"
                        value={formData.address}
                        onChange={handleChangeInput}
                        maxLength={255}
                        rows={4}
                        multiline={true}
                        type="tel"
                        helperText={formError.address}
                        error={!!formError.address}
                        icon={<MapPin className="w-4 h-4" />}
                      />
                    </div>
                  </div>
                </div>

                {/* Image upload */} 
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg mr-4">
                      <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Employee Image</h2>
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
                        <div className={`relative border-2 border-dashed ${formError.image ? "border-red-400" : "border-gray-300 hover:border-[#FCD000]"} dark:border-gray-600 rounded-xl overflow-hidden transition-colors group`}>
                          <div className="aspect-video bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                            <img
                              src={preview}
                              alt="Preview"
                              className="object-cover w-full h-full"
                            />
                          </div>
  
                          {/* Upload overlay for empty state */}
                          {!formData.image && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90">
                              <Upload className="w-12 h-12 text-[#FCD000] mb-3" />
                              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">Click to upload image</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">PNG, JPG up to 10MB</p>
                            </div>
                          )}
  
                          {/* Change image overlay */}
                          {formData.image && (
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
                    {formData.image && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <ImageIcon className="w-5 h-5 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.image.name}
                          </span>
                        </div>
                        {/* <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(formData.image.size / 1024 / 1024).toFixed(2)} MB
                        </span> */}
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

            {/* Right column - summary */}
            <div className="lg:col-span-1">
              <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${id ? "mb-6" :  " sticky top-8" }`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Form Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Role :
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.role || "Not specified"}
                      </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      First Name :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.first_name || "Not specified"}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last Name :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.last_name || "Not specified"}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Email  :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.email || "Not specified"}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Password :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.password || "Not specified"}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Confirm Password :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.confirm_password || "Not specified"}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Phone :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.phone || "Not specified"}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Address :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.address || "Not specified"}
                    </span>
                </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Image :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.image ? 'Uploaded' : 'Not uploaded'}
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

            { id && userInfo != null && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Account Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Account Created :
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        { new Date(userInfo.created_at).toLocaleDateString() }
                      </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      { new Date(userInfo.updated_at).toLocaleDateString() }
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Account Status :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {userInfo.status}
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
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default EmployeeForm
