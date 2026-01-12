import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Home, Save, CheckCircle, Upload, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Breadcrumb from '../../../../components/Navigation/Breadcrumbs';
import CustomTextField from '../../../../components/Fields/CustomTextField';
import Snackbar from '../../../../components/feedback/Snackbar';
import { AlertColor } from '@mui/material/Alert';
import AddImageIcon from '../../../../../public/add-image-icon.jpg';
import { createBanner, updateBanner, fetchBannerByPid } from '../../../../services/Ecommerce/bannerServices'

interface FormError {
    title?: string; 
    startDate?: string;
    endDate?: string;
    image?: string;
}

const BannerManagerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showAlert, setShowAlert] = useState(false);
    const [message, setMessage] = useState('');
    const [snackBarType, setSnackBarType] = useState<AlertColor>('success');

    const [formData, setFormData] = useState({
        title: '', 
        startDate: '',
        endDate: '',
        image: null,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState<FormError>({});

    // Keep track of the latest created object URL so it can be revoked (prevent leaks)
    const latestObjectUrl = useRef<string | null>(null);

    // memoized preview: prefer the imagePreview (which will contain an object URL when a File is selected),
    // otherwise fall back to the static AddImageIcon
    const preview = useMemo(() => {
        if (typeof imagePreview === 'string' && imagePreview.trim() !== '') {
            return imagePreview;
        }
        return AddImageIcon;
    }, [imagePreview]);

    // Revoke the last object URL on unmount
    useEffect(() => {
      return () => {
        if (latestObjectUrl.current) {
          try {
            URL.revokeObjectURL(latestObjectUrl.current);
          } catch (e) {
            // ignore
          }
          latestObjectUrl.current = null;
        }
      };
    }, []);
 
    const { data: bannerInfo } = useQuery({
      queryKey: ['banner', id],
      queryFn: () => fetchBannerByPid(id),
      enabled: !!id,
    });
 
    const { 
      mutateAsync: createBannerAsync, 
      isPending: isCreating 
    } = useMutation({
      mutationFn: createBanner,
    });

    const { 
      mutateAsync: updateBannerAsync, 
      isPending: isUpdating 
    } = useMutation({
      mutationFn: updateBanner,
    });
 
    useEffect(() => { 
      console.log(bannerInfo)
      if (bannerInfo && id) {
        setFormData({
            title: bannerInfo.title || '', 
            startDate: bannerInfo.start_date || '',
            endDate: bannerInfo.end_date || '',
            image: null,
        });
        if (bannerInfo.image_url) setImagePreview(bannerInfo.image_url);
      }
    }, [bannerInfo, id]);

    const validateForm = () => {
        const newErrors: FormError = {};
        if (!formData.title.trim()) newErrors.title = 'Title required'; 
        if (!formData.startDate) newErrors.startDate = 'Start date required';
        if (!formData.endDate) newErrors.endDate = 'End date required';
        
        // Validate date range
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (start >= end) {
                newErrors.endDate = 'End date must be after start date';
            }
        }

        if (!id && !imageFile) newErrors.image = 'Image required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10485760) {
                setErrors((prev) => ({ ...prev, image: 'Image must be less than 10MB' }));
                return;
            }
            // create one object URL and track it so we can revoke it later
            const objectUrl = URL.createObjectURL(file);
            // revoke previous
            if (latestObjectUrl.current) {
                try {
                    URL.revokeObjectURL(latestObjectUrl.current);
                } catch (e) {
                    // ignore
                }
            }
            latestObjectUrl.current = objectUrl;
            setImageFile(file);
            setImagePreview(objectUrl);
            setErrors((prev) => ({ ...prev, image: '' }));
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (!validateForm()) {
            setSnackBarType("error")
            setMessage("Please fill in all required fields.")
            setShowAlert(true);
            return
        } 

        try {
            const data = new FormData();
            data.append('title', formData.title); 
            data.append('startDate', formData.startDate);
            data.append('endDate', formData.endDate);
            if (imageFile) data.append('image', imageFile);
 
            if (id) {
              await updateBannerAsync({ id: bannerInfo.id, bannerData: data });
              setMessage('Banner updated successfully!');
            } else {
              await createBannerAsync(data);
              setMessage('Banner created successfully!');
            }
            queryClient.invalidateQueries({ queryKey: ['banners'] });
              setSnackBarType('success');
            setTimeout(() => navigate('/beesee/manage-banner'), 1500);
        } catch (error) {
            setSnackBarType('error');
            setMessage('Failed to save banner. Please try again.');
        } finally {
            setShowAlert(true);
        }
    };

    const completionPercentage = useMemo(() => {
        let filled = 0;
        if (formData.title.trim()) filled++; 
        if (formData.startDate) filled++;
        if (formData.endDate) filled++;
        if (id || imagePreview) filled++;
        return Math.floor((filled / 4) * 100);
    }, [formData, imagePreview, id]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <Snackbar open={showAlert} type={snackBarType} message={message} onClose={() => setShowAlert(false)} />
                <div className="mb-6">
                    <Breadcrumb
                        items={[
                            { label: 'Home', href: '/beesee/dashboard', icon: <Home className="w-4 h-4" /> },
                            { label: 'Banners', href: '/beesee/banners', icon: <AlertCircle className="w-4 h-4" /> },
                            { label: id ? 'Edit' : 'Create', isActive: true },
                        ]}
                    />
                </div>

                {/* Header - actions (Cancel / Save) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{id ? 'Update Banner' : 'Create New Banner'}</h1>
                            <p className="text-gray-600 dark:text-gray-400">Create or update a promotional banner with scheduling</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigate('/beesee/banners')}
                                disabled={isCreating || isUpdating}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubmit()}
                                disabled={isCreating || isUpdating}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                            >
                                {/* {isCreating || isUpdating ? (
                                    <span>{id ? 'Updating...' : 'Creating...'}</span>
                                ) : (
                                    <> */}
                                        <Save className="w-5 h-5 mr-2" />
                                        {id ? 'Update Banner' : 'Create Banner'}
                                    {/* </>
                                )} */}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                {id ? 'Edit Banner' : 'Create New Banner'}
                            </h1>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Title *
                                    </label>
                                    <CustomTextField
                                        name="title"
                                        placeholder="Enter banner title"
                                        value={formData.title}
                                        multiline={false}
                                        rows={1}
                                        type="text"
                                        maxLength={100}
                                        onChange={(e) => {
                                            setFormData((prev) => ({ ...prev, title: e.target.value }));
                                            setErrors((prev) => ({ ...prev, title: '' }));
                                        }}
                                        error={!!errors.title}
                                        helperText={errors.title}
                                    />
                                </div> 

                                {/* Scheduling Section */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <div className="flex items-center mb-6">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-4">
                                            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Scheduling</h2>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Set when the banner should be displayed</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Start Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Start Date *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={(e) => {
                                                    setFormData((prev) => ({ ...prev, startDate: e.target.value }));
                                                    setErrors((prev) => ({ ...prev, startDate: '' }));
                                                }}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#FCD000] focus:ring-1 focus:ring-[#FCD000] transition-colors"
                                            />
                                            {errors.startDate && (
                                                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                                            )}
                                        </div>

                                        {/* End Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                End Date *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={(e) => {
                                                    setFormData((prev) => ({ ...prev, endDate: e.target.value }));
                                                    setErrors((prev) => ({ ...prev, endDate: '' }));
                                                }}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#FCD000] focus:ring-1 focus:ring-[#FCD000] transition-colors"
                                            />
                                            {errors.endDate && (
                                                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <div className="flex items-center mb-6">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg mr-4">
                                            <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Banner Image</h2>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Upload a promotional image</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="image-upload"
                                                className="hidden"
                                                onChange={handleImageSelect}
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
                                                    {preview === AddImageIcon && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90">
                                                            <Upload className="w-12 h-12 text-[#FCD000] mb-3" />
                                                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">Click to upload image</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">PNG, JPG up to 10MB</p>
                                                        </div>
                                                    )}
                                                    {/* Change image overlay */}
                                                    {preview !== AddImageIcon && (
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
                                        {imageFile && (
                                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex items-center">
                                                    <Upload className="w-5 h-5 text-gray-500 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {imageFile.name}
                                                    </span>
                                                </div>
                                                <span className="text-md text-gray-500 dark:text-gray-400">
                                                    {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                            </div>
                                        )}
                                        {/* Error message */}
                                        {errors.image && (
                                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <p className="text-red-600 dark:text-red-400 text-sm">{errors.image}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Sidebar - Completion & Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Form Completion */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Form Completion</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {completionPercentage}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completionPercentage}%` }}
                                            transition={{ duration: 0.5 }}
                                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${formData.title.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className="text-gray-700 dark:text-gray-300">Title</span>
                                    </div> 
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${formData.startDate ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className="text-gray-700 dark:text-gray-300">Start Date</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${formData.endDate ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className="text-gray-700 dark:text-gray-300">End Date</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${id || imagePreview ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className="text-gray-700 dark:text-gray-300">Image</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">Title</p>
                                    <p className="font-medium text-gray-900 dark:text-white truncate">{formData.title || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formData.startDate ? new Date(formData.startDate).toLocaleString() : 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">End Date</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formData.endDate ? new Date(formData.endDate).toLocaleString() : 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {completionPercentage === 100 ? '✅ Ready' : '⏳ Incomplete'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerManagerForm;
