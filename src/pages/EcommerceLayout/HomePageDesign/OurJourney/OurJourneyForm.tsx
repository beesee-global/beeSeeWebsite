import React, { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Save,
  Home,
  SquarePen,
  MapPin,
  Upload,
  CheckCircle,
  Image as ImageIcon,
  FileText,
  Calendar,
} from 'lucide-react';
import Breadcrumb from '../../../../components/Navigation/Breadcrumbs';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import CustomTextField from '../../../../components/Fields/CustomTextField';
import AddImageIcon from '../../../../../public/add-image-icon.jpg';
import { AlertColor } from '@mui/material/Alert';
import Snackbar from '../../../../components/feedback/Snackbar';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  createJourney,
  updateJourney,
  fetchJourneyById,
} from '../../../../services/Ecommerce/ourJourneyServices';

interface FormJourneyData {
  title: string;
  description: string;
  year?: string;
  image?: File | null;
}

interface FormError {
  title?: string;
  description?: string;
  year?: string;
  image?: string;
}

const OurJourneyForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [formError, setFormError] = useState<FormError>({});
  const [message, setMessage] = useState('');
  const [snackBarType, setSnackBarType] = useState<AlertColor>('success');
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const [formJourneyData, setFormJourneyData] = useState<FormJourneyData>({
    title: '',
    description: '',
    year: '',
    image: null,
  });

  // ✅ Validation
  const validateForm = (): FormError => {
    const errors: FormError = {};
    if (!formJourneyData.title.trim()) errors.title = 'Journey title is required';
    if (!formJourneyData.description.trim()) errors.description = 'Description is required';
    if (!formJourneyData.year?.trim()) errors.year = 'Year is required';
    if (!formJourneyData.image) {
      errors.image = 'Please upload an image';
    } else {
      if (formJourneyData.image instanceof File) {
        const imageSizeMB = formJourneyData.image.size / 1024 / 1024;
        if (imageSizeMB > 10) {
          errors.image = 'Maximum file size is 10 MB';
        }
      }
    }
    return errors;
  };

  // ✅ Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormJourneyData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleImageChange = (file: File | null) => {
    setFormJourneyData((prev) => ({
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

  // ✅ Mutation for creating journey
  const { mutateAsync: createJourneyAsync, isPending: isCreating } = useMutation({
    mutationFn: createJourney,
  });

  // ✅ Mutation for updating journey
  const { mutateAsync: updateJourneyAsync, isPending: isUpdating } = useMutation({
    mutationFn: updateJourney,
  });
  
  // Fetch data only when id exists (for editing)
  const { data: journeyInfo } = useQuery({
    queryKey: ["journey", id],
    queryFn: () => fetchJourneyById(id as string | number),
    enabled: !!id // only fetch when id is defined
  })

  // ✅ Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const errors = validateForm();
      setFormError(errors);
      if (Object.keys(errors).length > 0) {
        setSnackBarType('error');
        setMessage('Please fill in all required fields.');
        setShowAlert(true);
        return;
      }

      const formDataToSend = new FormData();
      Object.entries(formJourneyData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value);
        }
      });

      if (id) {
        // remove image if not changed
        if (typeof formJourneyData.image === 'string') {
          formDataToSend.delete('image');
        }
        await updateJourneyAsync({ id: journeyInfo.id, journeyData: formDataToSend});
      } else {
        await createJourneyAsync(formDataToSend);
      }

      setSnackBarType('success');
      setMessage(id ? 'Journey updated successfully!' : 'Journey created successfully!');
      setShowAlert(true);
      setTimeout(() => navigate('/beesee/our-journey'), 2000);
    } catch (error: any) {
      console.error('❌ Error with journey:', error);

        // check if its an axios error
      if (error.response?.status === 400) {
        const message = error.response.data?.message;

        // handle specific backend validation
        if (message === "Journey title already exists") {
          setFormError((prev) => ({
            ...prev,
            title: message, // show inline email error
          })); 
        }

         // handle specific backend validation
        if (message === "Journey description already exists") {
          setFormError((prev) => ({
            ...prev,
            description: message, // show inline email error
          })); 
        }
      }
      
      setSnackBarType('error');
      setMessage('Failed to save journey. Please try again.');
      setShowAlert(true);
    }
  };

  // Memoized preview
  const preview = useMemo(() => {
    if (formJourneyData.image instanceof File) {
      return URL.createObjectURL(formJourneyData.image);
    } else if (typeof formJourneyData.image === "string" && formJourneyData.image.trim() !== "") {
      return formJourneyData.image
    } else {
      return AddImageIcon;
    }
  }, [formJourneyData.image]);

  // Cleanup blob URLs
  useEffect(() => {
    let objectUrl: string | undefined;

    if (formJourneyData.image instanceof File) {
      objectUrl = URL.createObjectURL(formJourneyData.image);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [formJourneyData.image]);

  // When journey info arrives, update the form (for editing)
  useEffect(() => {
    if (journeyInfo) {
      setFormJourneyData({
        title: journeyInfo.title || "",
        description: journeyInfo.description || "",
        year: journeyInfo.year || "",
        image: journeyInfo.image || null
      })
    }
  }, [journeyInfo])

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
              { label: 'Our Journey', href: '/beesee/our-journey', icon: <MapPin className="w-4 h-4" /> },
              { label: 'Journey Form', isActive: true, icon: <SquarePen className="w-4 h-4" /> },
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {id ? 'Update Journey Milestone' : 'Create New Journey Milestone'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add a new milestone to your company's journey
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/beesee/our-journey')}
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
                  <span>{id ? 'Updating...' : 'Creating...'}</span>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {id ? 'Update Journey' : 'Create Journey'}
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
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Essential journey milestone details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Journey Title */}
                  <div>
                    <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Journey Title *
                    </div>
                    <CustomTextField
                      name="title"
                      placeholder="Enter journey milestone title"
                      value={formJourneyData.title}
                      multiline={false}
                      rows={1}
                      type="text"
                      maxLength={100}
                      onChange={handleInputChange}
                      error={!!formError.title}
                      helperText={formError.title}
                      icon={<MapPin className="w-4 h-4" />}
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year *
                    </div>
                    <CustomTextField
                      name="year"
                      placeholder="Enter year (e.g., 2020)"
                      value={formJourneyData.year || ''}
                      multiline={false}
                      rows={1}
                      type="    "
                      maxLength={4}
                      onChange={handleInputChange}
                      error={!!formError.year}
                      helperText={formError.year}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </div>
                    <CustomTextField
                      name="description"
                      placeholder="Describe this milestone in your company's journey"
                      value={formJourneyData.description}
                      multiline={true}
                      rows={4}
                      type="text"
                      maxLength={500}
                      onChange={handleInputChange}
                      error={!!formError.description}
                      helperText={formError.description}
                      icon={<FileText className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg mr-4">
                    <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Journey Image</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Upload an image for this milestone</p>
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

                    <div
                      onClick={() => document.getElementById('image-upload')?.click()}
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
                        {!formJourneyData.image && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90">
                            <Upload className="w-12 h-12 text-[#FCD000] mb-3" />
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">Click to upload image</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">PNG, JPG up to 10MB</p>
                          </div>
                        )}

                        {/* Change image overlay */}
                        {formJourneyData.image && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-white text-center">
                              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                              <p className="font-medium">Change Image</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* File info */}
                    {formJourneyData.image && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <ImageIcon className="w-5 h-5 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formJourneyData.image.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {(formJourneyData.image.size / 1024 / 1024).toFixed(2)} MB
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
              </div>
            </form>
          </div>          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Form Summary</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Journey Title:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formJourneyData.title || 'Not specified'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Year:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formJourneyData.year || 'Not specified'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Description:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formJourneyData.description ? 'Added' : 'Not specified'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Image:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formJourneyData.image ? 'Uploaded' : 'Not uploaded'}
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-2 ${formJourneyData.title ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-gray-600 dark:text-gray-400">Title</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-2 ${formJourneyData.year ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-gray-600 dark:text-gray-400">Year</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-2 ${formJourneyData.description ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-gray-600 dark:text-gray-400">Description</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-2 ${formJourneyData.image ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-gray-600 dark:text-gray-400">Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurJourneyForm;
