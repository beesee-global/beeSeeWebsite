import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Home, Plus, Trash2, Save, CheckCircle, Zap, ChevronDown, Upload, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Breadcrumb from '../../../../components/Navigation/Breadcrumbs';
import CustomTextField from '../../../../components/Fields/CustomTextField';
import CustomIconPicker from '../../../../components/Fields/CustomIconPicker';
import Snackbar from '../../../../components/feedback/Snackbar';
import { AlertColor } from '@mui/material/Alert';
import { createSolution, updateSolution, fetchSolutionByPid } from '../../../../services/Ecommerce/solutionsOverviewServices';
import AddImageIcon from '../../../../../public/add-image-icon.jpg';

interface FormError {
    title?: string;
    description?: string;
    icon?: string;
    features?: string;
    specs?: string;
    image?: string;
}

const SolutionsOverviewForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showAlert, setShowAlert] = useState(false);
    const [message, setMessage] = useState('');
    const [snackBarType, setSnackBarType] = useState<AlertColor>('success');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: '',
        features: [''],
        specs: [{ key: '', value: '' }],
        image: null,
    });

    const [imageFile, setImageFile] = useState(null);
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

    const { data: solutionInfo } = useQuery({
        queryKey: ['solution', id],
        queryFn: () => fetchSolutionByPid(id),
        enabled: !!id,
    });

    const { mutateAsync: createSolutionAsync, isPending: isCreating } = useMutation({
        mutationFn: createSolution,
    });

    const { mutateAsync: updateSolutionAsync, isPending: isUpdating } = useMutation({
        mutationFn: updateSolution,
    });

    useEffect(() => { 
        if (solutionInfo && id) { 
            // Convert specs object to array of { key, value } ensuring values are strings
            const specsArray = solutionInfo.specs
                ? Object.entries(solutionInfo.specs).map(([key, value]) => ({ key, value: String(value) }))
                : [{ key: '', value: '' }];

            setFormData({
                title: solutionInfo.title || '',
                description: solutionInfo.description || '',
                icon: solutionInfo.icon || '',
                features: solutionInfo.features && solutionInfo.features.length > 0
                    ? solutionInfo.features
                    : [''],
                specs: specsArray,
                image: null, // We store the new file only when the user selects one
            });

            if (solutionInfo.images) setImagePreview(solutionInfo.images);
        }
    }, [solutionInfo, id]);

    const validateForm = () => {
        const newErrors: FormError = {};
        if (!formData.title.trim()) newErrors.title = 'Title required';
        if (!formData.description.trim()) newErrors.description = 'Description required';
        if (!formData.icon) newErrors.icon = 'Icon required';
        if (formData.features.some((f) => !f.trim())) newErrors.features = 'All features required';
        if (formData.specs.some((s) => !s.key.trim() || !s.value.trim())) newErrors.specs = 'All specs required';
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

    const handleAddFeature = () => {
        setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
    };

    const handleRemoveFeature = (index: number) => {
        setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.map((f, i) => (i === index ? value : f)),
        }));
    };

    const handleAddSpec = () => {
        setFormData((prev) => ({ ...prev, specs: [...prev.specs, { key: '', value: '' }] }));
    };

    const handleRemoveSpec = (index: number) => {
        setFormData((prev) => ({ ...prev, specs: prev.specs.filter((_, i) => i !== index) }));
    };

    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        setFormData((prev) => ({
            ...prev,
            specs: prev.specs.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)),
        }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (!validateForm()) return;

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('icon', formData.icon);
            data.append('features', JSON.stringify(formData.features.filter((f) => f.trim())));
            const specsObj = formData.specs.filter((s) => s.key.trim() && s.value.trim()).reduce((acc: any, spec) => {
                acc[spec.key] = spec.value;
                return acc;
            }, {});
            data.append('specs', JSON.stringify(specsObj));
            if (imageFile) data.append('image', imageFile);

            if (id) {
                await updateSolutionAsync({ id: solutionInfo.id, solutionData: data });
                setMessage('Solution updated successfully!');
            } else {
                await createSolutionAsync(data);
                setMessage('Solution created successfully!');
            }
            queryClient.invalidateQueries({ queryKey: ['solutions'] });
            setSnackBarType('success');
            setTimeout(() => navigate('/beesee/solutions-overview'), 1500);
        } catch (error) {
            setSnackBarType('error');
            setMessage('Failed to save solution. Please try again.');
        } finally {
            setShowAlert(true);
        }
    };

    const completionPercentage = useMemo(() => {
        let filled = 0;
        if (formData.title.trim()) filled++;
        if (formData.description.trim()) filled++;
        if (formData.icon) filled++;
        if (formData.features.some((f) => f.trim())) filled++;
        if (formData.specs.some((s) => s.key.trim() && s.value.trim())) filled++;
        if (id || imagePreview) filled++;
        return Math.floor((filled / 6) * 100);
    }, [formData, imagePreview, id]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
            <div className="w-full mx-auto px-3 sm:px-6 lg:px-8">
                <Snackbar open={showAlert} type={snackBarType} message={message} onClose={() => setShowAlert(false)} />
                <div className="mb-4 sm:mb-6">
                    <Breadcrumb
                        items={[
                            { label: 'Home', href: '/beesee/dashboard', icon: <Home className="w-4 h-4" /> },
                            { label: 'Solutions', href: '/beesee/solutions-overview', icon: <Zap className="w-4 h-4" /> },
                            { label: id ? 'Edit' : 'Create', isActive: true },
                        ]}
                    />
                </div>

                {/* Header - actions (Cancel / Save) like CategoryForm */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 truncate">{id ? 'Update Solution' : 'Create New Solution'}</h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-2">Create or update a solution with features and specifications</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <button
                                onClick={() => navigate('/beesee/solutions-overview')}
                                disabled={isCreating || isUpdating}
                                className="px-3 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-xs sm:text-base whitespace-nowrap"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubmit()}
                                disabled={isCreating || isUpdating}
                                className="flex items-center justify-center px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 text-xs sm:text-base whitespace-nowrap"
                            >
                                {isCreating || isUpdating ? (
                                    <span>{id ? 'Updating...' : 'Creating...'}</span>
                                ) : (
                                    <>
                                        <Save className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">{id ? 'Update Solution' : 'Create Solution'}</span>
                                        <span className="sm:hidden">{id ? 'Update' : 'Create'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="grid lg:grid-cols-3 gap-6 4 sm:space-y-lg:gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                                {id ? 'Edit Solution' : 'Create New Solution'}
                            </h1>
                            <form onSubmit={handleSubmit} className="space-y-6"> 
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Title *
                                    </label>
                                    <CustomTextField
                                        name="title"
                                        placeholder="Enter solution title"
                                        value={formData.title}
                                        multiline={false}
                                        rows={1}
                                        type="text"
                                        maxLength={100}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                        error={!!errors.title}
                                        helperText={errors.title}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description *
                                    </label>
                                    <CustomTextField
                                        name="description"
                                        placeholder="Enter detailed description"
                                        value={formData.description}
                                        multiline={true}
                                        rows={5}
                                        type="text"
                                        maxLength={500}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                        error={!!errors.description}
                                        helperText={errors.description}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon *</label>
                                    <CustomIconPicker
                                        value={formData.icon}
                                        onChange={(iconName: string) => setFormData((prev) => ({ ...prev, icon: iconName }))}
                                        label="Select Icon"
                                        error={!!errors.icon}
                                    />
                                    {errors.icon && <p className="text-red-500 text-md mt-1">{errors.icon}</p>}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Key Features *
                                        </label>
                                        <button type="button" onClick={handleAddFeature} className="flex items-center gap-1 text-yellow-600 text-sm">
                                            <Plus className="w-4 h-4" /> Add Feature
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {formData.features.map((feature, index) => (
                                            <motion.div key={index} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                                                <CustomTextField
                                                    name={`feature-${index}`}
                                                    placeholder={`Feature ${index + 1}`}
                                                    value={feature}
                                                    multiline={false}
                                                    rows={1}
                                                    type="text"
                                                    maxLength={255}
                                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                                />
                                                {formData.features.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveFeature(index)} 
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                    {errors.features && <p className="text-red-500 text-md">{errors.features}</p>}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Technical Specifications *
                                        </label>
                                        <button type="button" onClick={handleAddSpec} className="flex items-center gap-1 text-yellow-600 text-sm">
                                            <Plus className="w-4 h-4" /> Add Spec
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {formData.specs.map((spec, index) => (
                                            <motion.div 
                                                key={index} 
                                                initial={{ opacity: 0, y: -10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                className="grid grid-cols-2 gap-2"
                                            >
                                                <CustomTextField
                                                    name={`spec-key-${index}`}
                                                    placeholder="Specification name"
                                                    value={spec.key}
                                                    multiline={false}
                                                    rows={1}
                                                    type="text"
                                                    maxLength={255}
                                                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                                                />
                                                <div className="flex gap-2">
                                                    <CustomTextField
                                                        name={`spec-value-${index}`}
                                                        placeholder="Value"
                                                        value={spec.value}
                                                        multiline={false}
                                                        rows={1}
                                                        type="text"
                                                        maxLength={255}
                                                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                                    />
                                                    {formData.specs.length > 1 && (
                                                        <button type="button" onClick={() => handleRemoveSpec(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    {errors.specs && <p className="text-red-500 text-md">{errors.specs}</p>}
                                </div>
                                <div>
                                    {/* Image Upload */}
                                    <div className=''>
                                        <div className="flex items-center mb-6">
                                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg mr-4">
                                                <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Solution Image</h2>
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
                                </div>
                                {/* submit handled by header Save button */}
                            </form>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Form Completion</h3>
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
                                        <div className={`w-2 h-2 rounded-full ${formData.description.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className="text-gray-700 dark:text-gray-300">Description</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${formData.features.some((f) => f.trim()) ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className="text-gray-700 dark:text-gray-300">Features</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${formData.specs.some((s) => s.key.trim() && s.value.trim()) ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className="text-gray-700 dark:text-gray-300">Specs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${id || imagePreview ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className="text-gray-700 dark:text-gray-300">Image</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">Title</p>
                                    <p className="font-medium text-gray-900 dark:text-white truncate">{formData.title || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">Icon</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formData.icon}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">Features</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formData.features.filter((f) => f.trim()).length} added
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                                        Specifications
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formData.specs.filter((s) => s.key.trim() && s.value.trim()).length} added
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

export default SolutionsOverviewForm;
