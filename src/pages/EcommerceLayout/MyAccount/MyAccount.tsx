import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock,
  Save,
  Edit3,
  Home,
  User2,
  CheckCircle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import CustomTextField from '../../../components/Fields/CustomTextField';
import Breadcrumb from '../../../components/Navigation/Breadcrumbs';
import Snackbar from '../../../components/feedback/Snackbar'
import { AlertColor } from '@mui/material/Alert';
import { useMutation, useQuery } from '@tanstack/react-query';
import { updateAccountInfo,fetchUserById } from '../../../services/Ecommerce/myAccountServices'
import AddImageIcon from './../../../../public/add-image-icon.jpg';
import { userAuth } from '../../../hooks/userAuth'
import { useNavigate } from 'react-router-dom';
import AlertDialog from '../../../components/feedback/AlertDialog';

interface AccountData {
  first_name : string;
  last_name : string;
  email: string;  
  password?: string;
  confirm_password?: string;
  image?: File | string | null;
}

interface FormError {
  first_name ?: string;
  last_name ?: string;
  email?: string;  
  password?: string;
  confirm_password?: string;
  image?: string;
}

const MyAccount = () => {
  const navigate = useNavigate()
  const { userInfo, logout } = userAuth();
  const id = userInfo?.id; // Example ID, replace with actual user ID

  const [isEditing, setIsEditing] = useState(false);

  const [message, setMessage] = useState<string>("")
  const [snackBarType, setSnackBarType] = useState<AlertColor>("success")
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [openModal, setOpenModal] = useState<boolean>(false);
  
  const [accountData, setAccountData] = useState<AccountData>({
    first_name : "",
    last_name : "",
    email: "",  
    password: "",
    confirm_password: "", 
  });

  const [formError, setFormError] = useState<FormError>({});

  // Breadcrumb configuration
  const breadcrumbItems = [ 
    { label: 'My Account', isActive: true }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAccountData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formError[name as keyof FormError]) {
      setFormError(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleImageChange = (file: File | null) => {
    setAccountData((prev) => ({
      ...prev,
      image: file 
    }));

    // Clear image error when file is selected
    if (file) {
      setFormError((prev) => ({
        ...prev,
        image: undefined
      }))
    }
  }

  const validateForm = (): FormError => {
    const errors: FormError = {};

    if (!accountData.first_name.trim()) errors.first_name = "First name is required"; 
    if (!accountData.last_name.trim()) errors.last_name = "Last name is required"; 
 
    // password validation
    if (accountData.password || accountData.confirm_password) {
      if (!accountData.password) {
        errors.password = "Password is required.";
      } else if (accountData.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
      } else if (!/[A-Z]/.test(accountData.password)) {
        errors.password = "Password must contain at least one uppercase letter.";
      } else if (!/[a-z]/.test(accountData.password)) {
        errors.password = "Password must contain at least one lowercase letter.";
      } else if (!/[0-9]/.test(accountData.password)) {
        errors.password = "Password must contain at least one number."
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(accountData.password)) {
        errors.password = 'Password must contain at least one special character.';
      }

      if (accountData.confirm_password !== accountData.password) errors.confirm_password = 'Passwords do not match.';  
    }
    
    if (accountData.image instanceof File) {
      const imageSizeMB = accountData.image.size / 1024 / 1024;
      if (imageSizeMB > 10) {
        errors.image = "Maximum file size is 10 MB"
      }
    }

    return errors;
  };

  /* updating data */
  const { 
    mutateAsync: updateAccountMutate,
    isPending
  } = useMutation({ 
    mutationFn: updateAccountInfo,
  });

  const handleSubmit = async () => {
    const errors = validateForm();
    setFormError(errors);

    if (Object.keys(errors).length > 0) {
      setSnackBarType("error");
      setMessage("Please fill in all required fields.");
      setShowAlert(true);
      setOpenModal(false)
      return;
    }

    try { 
      // prepare formdata for sending
      const formDataToSend = new FormData();
      Object.entries(accountData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value)
        }
      });

      // Remove image if it’s not changed (still URL string)
      if (typeof accountData.image === "string" || accountData.image === null) {
        formDataToSend.delete("image")
      }

      await updateAccountMutate({id: String(id), userData: formDataToSend })

      if (accountData.password) {
      // Clear password fields after successful update
        setAccountData(prev => ({
          ...prev,
          password: "",
          confirm_password: ""
        }));
      }
      
      setSnackBarType("success");
      setMessage("Account information updated successfully!");
 
      logout()
      navigate("/ecom/sign-in", {replace: true}) 
    } catch (error) {
      console.error("❌ Error updating account:", error);
      setSnackBarType("error");
      setOpenModal(false)
      setMessage("Failed to update information, please try again.");
    } finally {
      setShowAlert(true);
    }
  };

  // fetching data from backend
  const { data: userInformation } = useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUserById(String(id)), 
  });

  console.log(userInformation)

  // --- close modal ---
  const handleCloseModal = () => {
      setOpenModal(false); 
      setTitle('');
      setMessage('');
  };

  // --- open modal ---
  const handleOpenModal = () => {
      setOpenModal(true); 
      setTitle('Update Information');
      setMessage('Are you sure you want to update your information?');
  };

  // Cancel button — resets to fetched user info
  const handleCancel = () => {
    if (userInformation) {
      setAccountData({
        first_name: userInformation?.data?.first_name || "",
        last_name: userInformation?.data?.last_name || "",
        email: userInformation?.data?.email || "",  
      });
    }
    setFormError({});
    setIsEditing(false);
  };

  // ✅ 1. Memoized preview (perfect as you wrote)
  const preview = useMemo(() => {
    if (accountData.image instanceof File) {
      return URL.createObjectURL(accountData.image)
    } else if (typeof accountData.image === "string" && accountData.image.trim() !== "") {
      return accountData.image
    } else {
      return AddImageIcon
    }
  }, [accountData.image])

  // When user info changes (from query), populate the form
  useEffect(() => {  
    if (userInformation) {
      setAccountData({
        first_name: userInformation?.data?.first_name ,
        last_name: userInformation?.data?.last_name ,
        email: userInformation?.data?.email,  
        image: userInformation?.data?.image_url
      });
    }
  }, [userInformation]);

  // cleanup blob urls if a file is selected
  useEffect(() => {
    let objectUrl: string | undefined;

    if (accountData.image instanceof File) {
      objectUrl = URL.createObjectURL(accountData.image);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }, [accountData.image])
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Notification */}
        <Snackbar 
          open={showAlert}
          type={snackBarType}
          message={message}
          onClose={() => setShowAlert(false)}
        />

        {/* Modal Component */}
        <AlertDialog 
          open={openModal} 
          title={title} 
          message={message} 
          onClose={handleCloseModal} 
          onSubmit={handleSubmit}  
        />
 
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your account information and preferences
              </p>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-[#FCD000] text-gray-900 rounded-lg hover:bg-[#FCD000]/90 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOpenModal}
                    disabled={isPending}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* Basic information */}
          <div className='flex items-center mb-6'> 
            <div className='p-3 bg-blue-100 dark:blue-900/20 rounded-lg mr-4'>
              <User2 className='w-6 h-6 text-blue-600 dark:text-blue-400'/>
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Basic Information</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Image upload */} 
              <div className="md:col-span-1">
                <div className="flex items-center mb-6">  
                  <div> 
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload a representative image</label>
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
                        {!accountData.image && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90">
                            <Upload className="w-12 h-12 text-[#FCD000] mb-3" />
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">Click to upload image</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">PNG, JPG up to 10MB</p>
                          </div>
                        )}

                        {/* Change image overlay */}
                        {accountData.image && (
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

                  {/* Error message */}
                  {formError.image && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-600 dark:text-red-400 text-sm">{formError.image}</p>
                    </div>
                  )}
                </div>
              </div>
            
              <div className='md:col-span-3 space-y-2'>
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <CustomTextField
                    name="first_name"
                    placeholder="Enter your first name"
                    value={accountData.first_name}
                    onChange={handleInputChange}
                    multiline={false}
                    maxLength={50}
                    type="text"
                    rows={1}
                    icon={<User className="w-4 h-4" />}
                    error={!!formError.first_name}
                    helperText={formError.first_name}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <CustomTextField
                    name="last_name"
                    placeholder="Enter your last name"
                    value={accountData.last_name}
                    onChange={handleInputChange}
                    multiline={false}
                    maxLength={50}
                    type="text"
                    rows={1}
                    icon={<User className="w-4 h-4" />}
                    error={!!formError.last_name}
                    helperText={formError.last_name}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <CustomTextField
                    name="email"
                    placeholder="Enter your email address"
                    value={accountData.email}
                    onChange={handleInputChange}
                    multiline={false} 
                    maxLength={100}
                    type="email"
                    rows={1}
                    icon={<Mail className="w-4 h-4" />}
                    error={!!formError.email}
                    helperText={formError.email}
                  />
                </div>
      
                {/* password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <CustomTextField
                    name="password"
                    placeholder="Enter password"
                    value={accountData.password || ""}
                    onChange={handleInputChange}
                    multiline={false}
                    maxLength={50}
                    type="password"
                    rows={1}
                    icon={<Lock className="w-4 h-4" />}
                    error={!!formError.password}
                    helperText={formError.password}
                  />
                </div> 

                {/* confirm password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <CustomTextField
                    name="confirm_password"
                    placeholder="Enter confirm password"
                    value={accountData.confirm_password || ""}
                    onChange={handleInputChange}
                    multiline={false}
                    maxLength={50}
                    type="password"
                    rows={1}
                    icon={<Lock className="w-4 h-4" />}
                    error={!!formError.confirm_password}
                    helperText={formError.confirm_password}
                  />
                </div> 
              </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Account Created:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  { new Date(userInformation?.data?.created_at).toLocaleDateString() }
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Date(userInformation?.data?.updated_at).toLocaleDateString() }
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Account Status:</span>
                <span className="ml-2 text-green-600 dark:text-green-400">
                  {userInformation?.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">User Role:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {userInformation?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;