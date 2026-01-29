import React, { useEffect, useMemo, useState } from 'react';
import CustomTextField from '../../../components/Fields/CustomTextField';
import SnackbarTechnician from '../../../components/feedback/SnackbarTechnician';
import AlertDialog from '../../../components/feedback/AlertDialog';
import AddImageIcon from '../../../../public/add-image-icon.jpg';
import { AlertColor } from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { Edit3, Save, User2, User, Mail, Lock, MapPin, Image as ImageIcon, Upload, CheckCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchUserById, updateAccountInfo } from '../../../services/Technician/myAccountServices';
import { userAuth } from '../../../hooks/userAuth';

interface formData {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    confirm_password?: string;
    image?: File | string | null;
}

interface FormError {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    confirm_password?: string;
    image?: string;
}

const MyAccount = () => {
    const { logout, userInfo } = userAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const id = userInfo?.id;

    const [message, setMessage] = useState<string>('');
    const [snackBarType, setSnackBarType] = useState<AlertColor>('success');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [openModal, setOpenModal] = useState<boolean>(false);

    const [formData, setFormData] = useState<formData>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
    });

    const [formError, setFormError] = useState<FormError>({});

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // clear error when user start typing
        if (formError[name as keyof FormError]) {
            setFormError((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const validateForm = (): FormError => {
        const errors: FormError = {};

        if (!formData.first_name.trim()) errors.first_name = 'First name is required';
        if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        // password validation
        if (formData.password || formData.confirm_password) {
            if (!formData.password) {
                errors.password = 'Password is required.';
            } else if (formData.password.length < 8) {
                errors.password = 'Password must be at least 8 characters.';
            } else if (!/[A-Z]/.test(formData.password)) {
                errors.password = 'Password must contain at least one uppercase letter.';
            } else if (!/[a-z]/.test(formData.password)) {
                errors.password = 'Password must contain at least one lowercase letter.';
            } else if (!/[0-9]/.test(formData.password)) {
                errors.password = 'Password must contain at least one number.';
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
                errors.password = 'Password must contain at least one special character.';
            }

            if (formData.confirm_password !== formData.password) errors.confirm_password = 'Passwords do not match.';
        }

        if (formData.image instanceof File) {
            const imageSizeMB = formData.image.size / 1024 / 1024;
            if (imageSizeMB > 10) {
                errors.image = 'Maximum file size is 10 MB';
            }
        }
        return errors;
    };

    const handleImageChange = (file: File | null) => {
        setFormData((prev) => ({
            ...prev,
            image: file,
        }));

        // Clear image error when file is selected
        if (file) {
            setFormError((prev) => ({
                ...prev,
                image: undefined,
            }));
        }
    };

    // --- close Modal ---
    const handleCloseModal = () => {
        setOpenModal(false);
        setTitle('');
        setMessage('');
    };

    // --- open modal ---
    const handleOpenModal = () => {
        setOpenModal(true);
        setTitle('Update Information');
        setMessage('Are you sure you want to update your information? You will be logged out and need to log in again.');
    };

    // --- fetching data from backend
    const { data: userInformation } = useQuery({
        queryKey: ['users', id],
        queryFn: () => fetchUserById(Number(id)),
        enabled: !!id,
    });

    // --- update Information ---
    const { mutateAsync: updateAccountMutate, isPending } = useMutation({
        mutationFn: updateAccountInfo,
    });

    const preview = useMemo(() => {
        if (formData.image instanceof File) {
            return URL.createObjectURL(formData.image);
        } else if (typeof formData.image === 'string' && formData.image.trim() !== '') {
            return formData.image;
        } else {
            return AddImageIcon;
        }
    }, [formData.image]);

    useEffect(() => {
        if (userInformation) {
            setFormData({
                first_name: userInformation?.data.first_name,
                last_name: userInformation?.data.last_name,
                email: userInformation?.data.email,
                image: userInformation?.data.image_url,
            });
        }
    }, [userInformation]);

    // cleanup blob urls if a file is created
    useEffect(() => {
        let objectUrl: string | undefined;

        if (formData.image instanceof File) {
            objectUrl = URL.createObjectURL(formData.image);
        }

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [formData.image]);

    const handleSubmit = async () => {
        try {
            const errors = validateForm();
            setFormError(errors);

            if (Object.keys(errors).length > 0) {
                setSnackBarType('error');
                setMessage('Please fill in all required fields.');
                setShowAlert(true);
                setOpenModal(false);
                return;
            }

            // prepare form data for sending
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formDataToSend.append(key, value);
                }
            });

            // remove image if its not change
            if (typeof formData.image === 'string' || formData.image === null) {
                formDataToSend.delete('image');
            }

            await updateAccountMutate({ id: Number(id), userData: formDataToSend });

            if (formData.password) {
                // clear password fields after successful update
                setFormData((prev) => ({
                    ...prev,
                    password: '',
                    confirm_password: '',
                }));
            }

            setSnackBarType('success');
            setMessage('Account information updated successfully!');

            logout();
            navigate('/sign-in', { replace: true });
        } catch (err: any) {
            console.error('❌ Error updating account:', err);
            setSnackBarType('error');
            setOpenModal(false);
            setMessage('Failed to update information, please try again.');
        } finally {
            setShowAlert(true);
        }
    };

    const handleCancel = () => {
        setFormError({});
        setIsEditing(false);
        if (userInformation) {
            setFormData({
                first_name: userInformation.data.first_name || null,
                last_name: userInformation.data.last_name || null,
                email: userInformation.data.email || null,
            });
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Notification */}
                <SnackbarTechnician open={showAlert} type={snackBarType} message={message} onClose={() => setShowAlert(false)} />

                {/* Modal Component */}
                <AlertDialog open={openModal} title={title} message={message} onClose={handleCloseModal} onSubmit={handleSubmit} />

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Account</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information and preferences</p>
                        </div>

                        <div className="flex space-x-3">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center px-4 py-2 text-white rounded-lg bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 hover:from-gray-700 hover:via-gray-600 hover:to-gray-700 "
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900"
                                        onClick={handleOpenModal}
                                        disabled={false}
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
                    {/* Basic Information */}
                    <div className="flex items-center mb-6">
                        <div className="p-3 bg-blue-100 dark:blue-900/20 rounded-lg mr-4">
                            <User2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="col-span-3 md:grid md:grid-cols-2 md:gap-4">
                            {/* first name */}
                            <div>
                                <label htmlFor="" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    First Name *
                                </label>
                                <CustomTextField
                                    name="first_name"
                                    placeholder="Enter your first name"
                                    value={formData.first_name}
                                    onChange={handleChangeInput}
                                    multiline={false}
                                    maxLength={50}
                                    type="text"
                                    rows={1}
                                    icon={<User className="w-4 h-4" />}
                                    error={!!formError.first_name}
                                    helperText={formError.first_name}
                                />
                            </div>

                            {/* last name */}
                            <div>
                                <label htmlFor="" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Last Name *
                                </label>
                                <CustomTextField
                                    name="last_name"
                                    placeholder="Enter your last name"
                                    value={formData.last_name}
                                    onChange={handleChangeInput}
                                    multiline={false}
                                    maxLength={50}
                                    type="text"
                                    rows={1}
                                    icon={<User className="w-4 h-4" />}
                                    error={!!formError.last_name}
                                    helperText={formError.last_name}
                                />
                            </div>

                            {/* Email Address */}
                            <div>
                                <label htmlFor="" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address *
                                </label>
                                <CustomTextField
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChangeInput}
                                    multiline={false}
                                    disabled={id !== 2}
                                    maxLength={50}
                                    type="email"
                                    rows={1}
                                    icon={<Mail className="w-4 h-4" />}
                                    error={!!formError.email}
                                    helperText={formError.email}
                                />
                            </div>

                            {/* password */}
                            <div>
                                <label htmlFor="" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password *
                                </label>
                                <CustomTextField
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChangeInput}
                                    multiline={false}
                                    maxLength={60}
                                    type="password"
                                    rows={1}
                                    icon={<Lock className="w-4 h-4" />}
                                    error={!!formError.password}
                                    helperText={formError.password}
                                />
                            </div>

                            {/* confirm password */}
                            <div>
                                <label htmlFor="" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm Password *
                                </label>
                                <CustomTextField
                                    name="confirm_password"
                                    placeholder="Enter your confirm password"
                                    value={formData.confirm_password}
                                    onChange={handleChangeInput}
                                    multiline={false}
                                    maxLength={60}
                                    type="password"
                                    rows={1}
                                    icon={<Lock className="w-4 h-4" />}
                                    error={!!formError.confirm_password}
                                    helperText={formError.confirm_password}
                                />
                            </div>
                        </div>

                        {/* Image upload */}
                        <div className="md:col-span-1">
                            <label htmlFor="" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Profile Picture *
                            </label>
                            {/* <div className="flex items-center mb-6">
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg mr-4">
                                    <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Image</h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Upload a representative</p>
                                </div>
                            </div> */}

                            <div className="space-y-4">
                                <div className="relative group w-full max-w-2xl">
                                    <input accept="image/*" type="file" id="image-upload" className="hidden" onChange={(e) => handleImageChange(e.target.files?.[0] || null)} />
                                    <label htmlFor="image-upload" className="cursor-pointer block w-full">
                                        <div
                                            className={`relative border boder-dashed  dark:border-gray-600 rounded-xl overflow-hidden transition-colors group
                                        ${formError.image ? 'border-red-400' : 'border-gray-300'}`}
                                        >
                                            <div className="aspect-video bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                                                <img src={preview} alt="" className="object-cover w-full h-full" />
                                            </div>

                                            {/* Upload overlay for empty state */}
                                            {!formData.image && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90">
                                                    <Upload className="w-12 h-12 text-gray-700 mb-3" />
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
                                {/* {formData.image && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center">
                                            <ImageIcon className="w-5 h-5 text-gray-500 mb-2" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{formData.image.name}</span>
                                        </div>
                                    </div>
                                )} */}

                                {/* Upload Button */}
                                <div className="flex justify-center border-t py-2 border-gray-200">
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

                    {/* Account information */}
                    <div className="bg-white p-6 mt-8 pt-6 border-t dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Account Created:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{new Date(userInformation?.data?.created_at).toLocaleDateString()}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                                <span className="ml-2 text-gray-900 dark:text-whte">{new Date(userInformation?.data?.updated_at).toLocaleDateString()}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Account Status:</span>
                                <span className="ml-2 text-gray-900 dark:text-whte">{userInformation?.data?.details?.employment_status}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 dark:text-gray-400">User Role:</span>
                                <span className="ml-2 text-gray-900 dark:text-whte">{userInformation?.data?.details?.position}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAccount;
