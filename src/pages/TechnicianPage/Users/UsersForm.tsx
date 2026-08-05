import React, { useEffect, useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom" 
import CustomTextField from "../../../components/Fields/CustomTextField"
import CustomSelectField from "../../../components/Fields/CustomSelectField"
import Breadcrumb from "../../../components/Navigation/Breadcrumbs"   
import { useMutation, useQuery } from "@tanstack/react-query" 
import { verifyPassword } from '../../../services/Technician/userServices'
import { 
  createUsers, 
  fetchUsersByPid, 
  updateUsers,
  image,
  fetchPositions
} from '../../../services/Technician/userServices'
 import { 
  Mail,
  User2, 
  Pencil,
  Plus,
  Lock,
  FilePenLine,
  Image as ImageIcon, 
  Upload,
  Phone,
  CheckCircle, 
} from "lucide-react"
import { Email } from "@mui/icons-material" 
import { userAuth } from "../../../hooks/userAuth"
import ReusableTextFieldModal from "../../../components/feedback/ReusableTextFieldModal"

interface EmployeeFormProps {
  first_name: string,
  last_name: string,
  email: string, 
  password: string;
  confirm_password: string; 
  contact_number: string;
  role: string;
  status: string;
  image?: File | string | null
}

interface FormError {
  first_name?: string,
  last_name?: string,
  email?: string, 
  password?: string;
  contact_number?: string;
  confirm_password?: string; 
  role?: string;
  image?: string;
}

const UsersForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const {
    userInfo,
    setSnackBarMessage, 
    setSnackBarOpen, 
    setSnackBarType,
  } = userAuth();

  
  const Permission = userInfo?.permissions?.find(p => p.parent_id === 'users' && p.children_id === 'list_user');
  
  /* FormError */
  const [formError, setFormError] = useState<FormError>({})

  const [formData, setFormData] = useState<EmployeeFormProps>({
    first_name: "",
    last_name: "",
    email: "", 
    password: "",
    confirm_password: "",
    contact_number: "",
    role: "", 
    status: "Active", 
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
    const password = formData.password ?? "";

    if (!formData?.contact_number.trim()) errors.contact_number = 'Phone number is required.';
    else if (!/^09\d{9}$/.test(formData.contact_number)) errors.contact_number = 'Phone number must start with 09 and be 11 digits long.';

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

  // --- fetching positions --- 
  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: fetchPositions,
    select: (res) =>res.data.map((item: any) => ({
        value: item.id,
        label: item.name
    }))
  })

  // ✅ 2. Fetch data only when id exists
  const { data: userInformation } = useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUsersByPid(String(id)),
    enabled: !!id, // ✅ only fetch when id is defined
  });

  /* inserting data */
  const {
    mutateAsync: createUserMutate,
    isPending: isCreating,
  } = useMutation({
    mutationFn: createUsers,
  });

  /* inserting image */
  const { 
    mutateAsync: insertImage,
    isPending: isCreatingImage
   } = useMutation({
    mutationFn: ({ id, payloadImage }: { id: number; payloadImage: any }) =>
    image(id, payloadImage),
  });

  /* updating data */
  const {
    mutateAsync: updateUserMutate,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: ({ id, payload} : { id: number | string; payload: any }) => 
      updateUsers(id, payload),
  });
 
  // Verify password
  const {
    mutateAsync: verifyPasswords
  } = useMutation({
    mutationFn: verifyPassword
  });

  const handleVerifyPassword = async (formData: Record<string, string>) => {
    try {
      const formDataPassword = new FormData();
      formDataPassword.append('email', userInfo?.email);
      formDataPassword.append('password', formData.password)

      const response = await verifyPasswords(formDataPassword)

      if (response.success) { 
        setModalOpen(false);
        await handleSubmit();
      }
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message || "Failed to update position. Please try again.";
      const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");
      setSnackBarMessage(cleanMessage);
      setSnackBarType("error")
      setSnackBarOpen(true) 
    }
  }

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();

    try {
      const errors = validateForm();
      setFormError(errors);

      if (Object.keys(errors).length > 0) {
        setSnackBarType("error");
        setSnackBarMessage("Please fill in all required fields");
        setSnackBarOpen(true);
        return;
      }

      const payload: {
        user_id: string | number;
        first_name: string;
        last_name: string;
        email: string;
        contact_number: string;
        details: {
          employment_status: string;
          positions_id: string;
          url_permission: string;
        };
        password?: string;
      } = {
        user_id: userInfo?.id ?? "",
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        contact_number: formData.contact_number,
        details: {
          employment_status: formData.status,
          positions_id: formData.role,
          url_permission: "technician_url",
        },
      };

      // include password if provided
      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      if (id) { 
        // UPDATE USER
        await updateUserMutate({
          id: Number(userInformation?.data.id),
          payload,
        });

        // Upload image only if new image File selected
        if (formData.image instanceof File) {
          const payloadImage = new FormData();
          payloadImage.append("image", formData.image);
          payloadImage.append("status", "update");

          await insertImage({
            id: userInformation?.data.id,
            payloadImage,
          });
        }

      } else {
        // CREATE USER
        const response = await createUserMutate(payload);

        if (formData.image instanceof File) {
          const payloadImage = new FormData();
          payloadImage.append("image", formData.image);

          await insertImage({
            id: response.user_id,
            payloadImage,
          });
        }

      }

      setSnackBarType("success");
      setSnackBarMessage(id ? "User updated successfully" : "User created successfully");
      navigate("/beesee/users");

    } catch (error: any) {
      if (error.response?.status === 400) { 
        const rawMessage = error?.response?.data?.message || "Failed to update position. Please try again.";
        const cleanMessage = String(rawMessage).replace(/^error:\s*/i, "");

        console.log("Server validation error:", cleanMessage);

        // Properly map backend error messages to form fields
        if (cleanMessage == "Email already exists") {
          setFormError((prev) => ({
            ...prev,
            email: "Email already exists",
          }));
        }

        if (cleanMessage == "Name already exists") {
          setFormError((prev) => ({
            ...prev,
            name: "Name already exists",
          }));
        }

        
        setSnackBarType("error");
        setSnackBarMessage(`${cleanMessage}`);
      }


    } finally {
      setSnackBarOpen(true);
    }
  };


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
    }
  }, [formData.image]);

  useEffect(() => {
    if (userInformation?.data) {
      const u = userInformation.data;

      setFormData({
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        email: u.email || "",  
        contact_number: u.contact_number || "",
        role: u.details?.position || "",             // ✅ correct
        status: u.details?.employment_status || "Active", // ✅ correct 
        password: "",
        confirm_password: "",
        image: u.image_url || "",                    // ✅ correct user image URL
      });
    }
  }, [userInformation]);

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
    <div className="min-h-screen bg-white dark:bg-white py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">

        {/* Asking password */}
        <ReusableTextFieldModal 
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={"Enter your password"}
          fields={[
            {
              name: 'password',
              placeholder: 'Password',
              maxLength: '100',
              type: 'password',
              multiline: false,
              rows: 1,
              value: '',
              validator: (value) => (!value.trim() ? 'password is required' : undefined),
            }
          ]}
          onSubmit={handleVerifyPassword}
        />

        <div className="mb-6">
          {/* Breadcrumbs */}
          <Breadcrumb 
            items={[ 
              { label: "Users",  href: "/beesee/users", icon: <User2 className="w-4 h-4"/> },
              { label: "Users Form", isActive: true, icon: <FilePenLine className="w-4 h-4"/> }
            ]}
          />
        </div>

        {/* Header */}
        <div className=" rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl text-black mb-2">
                { id ? "Update User" : "Create New User" }
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                { id ? "Update a user " : "Add a new user  " } 
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/beesee/users')} 
                disabled={isCreating || isUpdating || isCreatingImage}
                className="px-6 py-3 border border-var(--bo-border-gold) dark:border-var(--bo-border-gold) text-gray-black dark:text-black rounded-lg hover:bg-[#ff7676] dark:hover:bg-[#ff7676] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={id ? () => setModalOpen(true) : handleSubmit}
                disabled={isCreating || isUpdating || isCreatingImage}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {isCreating || isUpdating  || isCreatingImage? (
                  <span>
                    { id ? "Updating..." : "Creating..." }
                  </span>
                ) : (
                  <>
                    { id ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" /> }
                    { id ? "Update User" : "Create User" }
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left columns - form */}
            <div className="lg:col-span-2 space-y-8">
              <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-4">
                      <User2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-3xl text-black">Basic Information</h2>
                      <p className="text-gray-600 dark:text-gray-400">Essential user details</p>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="col-span-3 md:grid md:grid-cols-2 md:gap-4">
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
                        options={positions}
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
                        placeholder="Enter email"
                        value={formData.email}
                        disabled={!Permission?.actions.includes('edit')}
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

                    
                    {/* Contact number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Number *
                      </label>
                      <CustomTextField 
                        name="contact_number"
                        placeholder="Enter contact number"
                        value={formData.contact_number}
                        onChange={handleChangeInput}
                        maxLength={11}
                        rows={1}
                        multiline={false}
                        type="tel"
                        helperText={formError.contact_number}
                        error={!!formError.contact_number}
                        icon={<Phone className="w-4 h-4" />}
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

                    {id && (
                      <div>
                        {/* status */}
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status *
                        </label>
                        <CustomSelectField
                          name="status"
                          placeholder="Select Status"
                          value={formData.status}
                          onChange={handleChangeInput}
                          options={[
                            { value: '', label: 'Select Position' },
                            { value: 'Active', label: 'Active' }, 
                            { value: 'Resigned', label: 'Resigned' }, 
                            { value: 'Terminated', label: 'Terminated' }, 
                            { value: 'On-leave', label: 'On-leave' }, 
                          ]}
                          error={!!formError.role}
                          helperText={formError.role}
                        />
                      </div>
                    )}
                    </div>

                    <div className="md:col-span-1">
                    {/* Image upload */} 
                    <div className="rounded-xl">
                      <label htmlFor="" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Profile Picture *
                      </label>
                      {/* <div className="flex items-center mb-6">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg mr-4">
                          <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h2 className="text-xl text-black">User Image</h2>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Upload a representative image</p>
                        </div>
                      </div> */}
      
                      <div className="space-y-4">
                        <div className="relative group w-full max-w-sm mx-auto">

                          <input
                            type="file"
                            accept="image/*"
                            id="image-upload"
                            className="hidden"
                            onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                          />

                          <label htmlFor="image-upload" className="cursor-pointer block w-full">

                            <div
                              className={`
                              relative border-2
                              ${formError.image ? "border-red-400" : "border-gray-300 hover:border-[#FCD000]"}
                              dark:border-gray-600
                              rounded-xl
                              overflow-hidden
                              transition
                              `}
                            >
                              
                              {/* IMAGE AREA */}
                              <div className="h-52 bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">

                                {preview ? (
                                  <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : null}

                              </div>

                              {/* EMPTY STATE */}
                              {!formData.image && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90">
                                  <Upload className="w-12 h-12 text-[#FCD000] mb-3" />
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Upload Image
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    PNG, JPG up to 10MB
                                  </p>
                                </div>
                              )}

                              {/* HOVER CHANGE IMAGE */}
                              {formData.image && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                  <div className="text-white text-center">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p className="font-semibold">Change Image</p>
                                  </div>
                                </div>
                              )}

                            </div>
                          </label>
                        </div>
                        {/* File info */}
                        {/* {formData.image && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                              <ImageIcon className="w-5 h-5 text-gray-500 mr-2" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {formData.image?.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {(formData.image.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        )} */}

                        {/* Upload Button */}
                        <div className="flex justify-center  border-t py-2 border-gray-200">
                            <label
                                htmlFor="image-upload"
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Upload className="w-5 h-5 mr-2" />
                                Upload Picture
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
                  </div>
                  </div>
                </div> 
              </form>
            </div>

           
        </main>
      </div>
    </div>
  )
}

export default UsersForm



/*     <div className="lg:col-span-1">
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
                      Image :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.image ? 'Uploaded' : 'Not uploaded'}
                    </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                 <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  All required fields completed
                </div>  
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
                        { new Date(userInfo?.data.created_at).toLocaleDateString() }
                      </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      { new Date(userInfo?.data.updated_at).toLocaleDateString() } 
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Account Status :
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {userInfo?.data?.details.employment_status}
                    </span>
                </div> 
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  All required fields completed
                </div>  
              </div>

            </div>
            )}
          </div> */
