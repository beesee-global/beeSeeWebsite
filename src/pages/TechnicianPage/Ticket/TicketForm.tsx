import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import { 
  X,
  FilePenLine,
  Send,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician"
import { userAuth } from "../../../hooks/userAuth"
import CustomTextField from "../../../components/Fields/CustomTextField"
import CustomSelectField from "../../../components/Fields/CustomSelectField"
import { useState, useEffect } from "react"
import {
  fetchSchools,
  fetchCategory,
  fetchDevices,
  createCustomerSupport,
  images,
  fetchIssue
} from '../../../services/Technician/customerSupportServices'
import { useMutation, useQuery } from "@tanstack/react-query"
import WorkIcon from '@mui/icons-material/Work';
import ImageUploadModal from "../../HomePagesPage/CustomerSupport/components/ImageUploadModal"

interface CustomerIssue {
  full_name: string; 
  company: string;
  city: string;
  email: string; 
  contact_number: string; 
  category_id: string;
  location: string;
  is_active: string;
  item_name?: string;
  device_id: string; 
  issue_id: string;
  questions: string;  
  serial_number: string;
}

interface FormError {
  full_name?: string;
  company?: string;
  city?: string;
  location?: string;
  email?: string;
  item_name?: string;
  issue_id?: string;
  contact_number?: string; 
  category_id?: string;
  device_id?: string;
  questions?: string; 
}

interface ImageData {
  id: string;
  file: File | null;
  base64: string | null;
  previewUrl: string | null;
}
 
const TicketForm = () => {
  const {
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType,
  } = userAuth();

  const [openUploadImageModal, setOpenUploadImageModal] = useState<boolean>(false);
  const [formError, setFormError] = useState<FormError> ({});
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [formData, setFormData] = useState<CustomerIssue>({
    full_name: '',
    company: '',
    city: '',
    email: '',
    contact_number: '',
    category_id: '',
    is_active: '',
    item_name: '',
    device_id: '',
    issue_id: '',
    questions: '',
    serial_number: '',
    location: '',
  }); 

  const { data: categoryResponse = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategory,
    select: (res) => res.data.map((item: any) => ({
      value: String(item.id),
      label: item.name,
      is_active: item.is_active
    }))
  })
  
  const { data: productResponse = [] } = useQuery({
    queryKey: ["device", formData?.category_id],
    queryFn: () => fetchDevices(Number (formData?.category_id)),
    enabled: !!formData?.category_id,
    select: (res) => {
      const mapped = res.data.map((item: any) => ({
        value: String(item.id),
        label: item.product_name
      })); 

      return mapped;
    }
  })

  const { data: issueResponse = [] } = useQuery({
    queryKey: ["issues", formData?.device_id],
    queryFn: () => fetchIssue(Number (formData?.device_id)),
    enabled: !!formData?.device_id,
    select: (res) => {
      const mapped = res.data.map((item: any) => ({
        value: String(item.id),
        label: item.name
      }));

      return mapped
    }
  })

  const {
    mutateAsync: createTicketMutate,
    isPending
  } = useMutation({
    mutationFn: createCustomerSupport
  })

  const {
    mutateAsync: insertImage, 
    isPending: isCreatingImage
  } = useMutation({
    mutationFn: images,
  });

  const handleChangeInput = (e: React.ChangeEvent <HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'category_id') {
      const selectedCategory = categoryResponse.find((item: any) => String(item.value) === String(value));
      setFormData((prev) => ({
        ...prev,
        category_id: String(value),
        is_active: selectedCategory?.is_active ?? ''
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }

    setFormError((prev) => ({
      ...prev,
      [name]: undefined
    }))
  }

  const validateError = (): FormError => {
    const errors: FormError = {};

      if (!formData?.full_name.trim()) errors.full_name = "Full name is required."; 
      if (!formData?.company.trim()) errors.company = "Company is required."
      if (!formData?.city.trim()) errors.city = "City is required."
      if (!formData?.email.trim()) errors.email = 'Email is required.';
      else if (!/\S+@\S+\.\S+/.test(formData?.email)) errors.email = "Email is invalid format";
     
      if (!formData?.contact_number.trim()) errors.contact_number = 'Phone number is required.'; 
      else if (!/^09\d{9}$/.test(formData?.contact_number)) errors.contact_number = 'Phone number must start with 09 and be 11 digits long.';
      if (!formData?.category_id) errors.category_id = "Device is required.";

      if (formData?.is_active === 'false') {
        if (!formData?.device_id) errors.device_id = "Model is required";
        if (!formData?.issue_id) errors.issue_id = "Issue Type is required";
      } else {
        if (!formData?.item_name?.trim()) errors.item_name = 'Item name is required';
      }

      if (!formData?.questions.trim()) errors.questions = "Please provide details about your issue."; 

      if (!formData?.location.trim()) errors.location = "Location is required."
   
    return errors;
  }

  const handleImageSubmit = (file: File | null, base64?: string) => {
    if (file) {
      const newImage: ImageData = {
        id: Date.now().toString(),
        file,
        base64: base64 || null,
        previewUrl: URL.createObjectURL(file)
      }
      setUploadedImages(prev => [...prev, newImage])
    }
  }

  const handleRemoveImage = (id: string) => {
    setUploadedImages(prev => prev?.filter(img => img.id !== id));
    if (currentImageIndex >= uploadedImages.length - 1) {
      setCurrentImageIndex(Math.max(0, uploadedImages?.length - 2));
    }
  }
  
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? uploadedImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === uploadedImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitted(true)
      const errors = validateError();
      setFormError(errors)

      if (Object.keys(errors).length > 0) {
        setSnackBarMessage("Please fill in all required fields.")
        setSnackBarType('error')
        setSnackBarOpen(true)
        return
      } else {

        const ticketsDetails: any = {
          categories_id: formData?.category_id,
          products_id: formData?.device_id,
          issues_id: formData?.issue_id,
          item_name: formData?.item_name,
          location: formData?.location,
          serial_number: formData?.serial_number,
          status: "open",
          questions: formData?.questions, 
        }

        const payload: any = {
          full_name: formData?.full_name,
          company: formData?.company,
          city: formData?.city,
          email: formData?.email,
          phone: formData?.contact_number, 
        }
 
        payload.tickets_details = ticketsDetails

        const response = await createTicketMutate(payload); 

        if (response?.success) {

          // Upload all images if they exist
          if (uploadedImages.length > 0) {
            for (const image of uploadedImages) {
              if (image.file) {
                const formDataImage = new FormData();
                formDataImage.append("image", image.file);
                await insertImage({ id: response.data.ticket_id, image: formDataImage });
              }
            }
          }

          // Reset form
          setFormData({
            full_name: '',
            company: '', 
            city: "",
            email: '',
            contact_number: '',
            item_name: '',
            is_active: '',
            issue_id: "",  
            category_id: '',
            device_id: '',
            serial_number: '',
            location: '',
            questions: '', 
          });

          setUploadedImages([]);
          setCurrentImageIndex(0);

          setSnackBarMessage("Ticket submitted successfully.")
          setSnackBarType('success')
          setSnackBarOpen(true)
        }
      }
    } catch (error) {
      setSnackBarMessage("Failed to submit, Please try again.")
      setSnackBarType('error')
      setSnackBarOpen(true)
    } finally {
      setIsSubmitted(false)
    }
  }

  useEffect(() => {
    if (formData?.category_id) {
      setFormData((prev) => ({
        ...prev,
        device_id: "",
        issue_id: ''
      }))
    }
  }, [formData.category_id])

  useEffect(() => {
    if (formData?.device_id) {
      setFormData((prev) => ({
        ...prev,
        issue_id: ''
      }))
    }
  }, [formData?.device_id])
  
  return (
    <div className="p-6 space-y-10">

      {/* image Modal */}
      <ImageUploadModal 
        open={openUploadImageModal}
        onClose={() => setOpenUploadImageModal(false)} 
        onSubmit={handleImageSubmit}
      />
      
      <div>
        <div className="flex items-center">
          <Breadcrumb 
            items={[ 
              { label: "Ticket Form", isActive: true, icon: <FilePenLine /> }
            ]}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Submit Ticket
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your support requests efficiently.
            </p>
          </div>

          <div>
            <button 
              className='flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md'
              onClick={() => handleSubmit()} 
              disabled={isSubmitted}
            >
              <Send className='w-4 h-4 mr-2' />
              {isSubmitted ? "Submitting..." : " Submit "}
          </button>
          </div>
        </div>
      </div>

      {/* form */}
      <form action="">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Basic Information */}
          <div className='flex items-center mb-6'> 
              <div>
                  <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                      Basic Information
                  </h2>
              </div>
          </div>

          <div className="flex flex-col space-y-3 md:pl-10">
            <div className="flex items-center">
              <div className="w-48">
                <span>Name:</span>
              </div>
              <div className="w-full max-w-lg">
                <CustomTextField
                  placeholder="John Doe"
                  name="full_name"
                  value={formData?.full_name}
                  onChange={handleChangeInput}
                  type="text"
                  multiline={false}
                  rows={1}
                  maxLength={100}
                  error={!!formError?.full_name}
                  helperText={formError?.full_name}
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-48">
                <span>Company:</span>
              </div>
              <div  className="w-full max-w-lg">
                <CustomTextField
                  placeholder="Company / Institution Name"
                  name="company"
                  value={formData?.company}
                  onChange={handleChangeInput}
                  type="text"
                  multiline={false}
                  rows={1}
                  maxLength={100} 
                  error={!!formError?.company}
                  helperText={formError?.company} 
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-48">
                <span>City:</span>
              </div>
              <div  className="w-full max-w-lg">
                <CustomTextField
                  placeholder="City"
                  name="city"
                  value={formData?.city}
                  onChange={handleChangeInput}
                  type="text"
                  multiline={false}
                  rows={1}
                  maxLength={100} 
                  error={!!formError?.city}
                  helperText={formError?.city} 
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-48">
                  <span>
                    Email
                  </span>
              </div>
              <div className="w-full max-w-lg">
                <CustomTextField 
                  placeholder="johndoe@example.ph" 
                  name="email"
                  value={formData?.email}
                  onChange={handleChangeInput}
                  type="text"
                  multiline={false}
                  rows={1}
                  maxLength={100}
                  error={!!formError?.email}         
                  helperText={formError?.email}           
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-48">
                  <span>
                    Contact number
                  </span>
              </div>
              <div className="w-full max-w-lg">
                <CustomTextField 
                  placeholder="09xxxxxxxxx" 
                  name="contact_number"
                  value={formData?.contact_number}
                  onChange={handleChangeInput}
                  type="tel"
                  multiline={false}
                  rows={1}
                  maxLength={11}
                  error={!!formError?.contact_number}         
                  helperText={formError?.contact_number}           
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-48">
                  <span>
                    Device
                  </span>
              </div>
              <div className="w-full max-w-lg">
                <CustomSelectField 
                  name="category_id" 
                  value={formData?.category_id} 
                  options={categoryResponse} 
                  onChange={handleChangeInput} 
                  placeholder="Select a Device Type" 
                  error={!!formError?.category_id} 
                  helperText={formError?.category_id} 
                />
              </div>
            </div>

            {formData?.category_id !== '' && (
              <div className="space-3">
                {formData?.is_active === 'false' ? (
                  <>
                    <div className="flex items-center">
                      <div className="w-48">
                          <span>
                            Model
                          </span>
                      </div>
                      <div className="w-full max-w-lg">
                        <CustomSelectField 
                          name="device_id" 
                          value={formData?.device_id} 
                          options={productResponse} 
                          onChange={handleChangeInput} 
                          placeholder="Select a Model Type" 
                          error={!!formError?.device_id} 
                          helperText={formError?.device_id} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center mt-3">
                      <div className="w-48">
                          <span>
                            Issue
                          </span>
                      </div>
                      <div className="w-full max-w-lg">
                        <CustomSelectField 
                          name="issue_id" 
                          value={formData?.issue_id} 
                          options={issueResponse} 
                          onChange={handleChangeInput} 
                          placeholder="Select a Issue type" 
                          error={!!formError?.issue_id} 
                          helperText={formError?.issue_id} 
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center">
                    <div className="w-48">
                      <span>Item name</span>
                    </div>
                    <div className="w-full max-w-lg">
                      <CustomTextField
                        placeholder="Item name"
                        name="item_name"
                        value={formData?.item_name}
                        onChange={handleChangeInput}
                        type="text"
                        multiline={false}
                        rows={1}
                        maxLength={100}
                        error={!!formError?.item_name}
                        helperText={formError?.item_name}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center mt-3">
                  <div className="w-48">
                      <span>
                        Serial Number
                      </span>
                  </div>
                  <div className="w-full max-w-lg">
                    <CustomTextField 
                      name="serial_number" 
                      value={formData?.serial_number}  
                      onChange={handleChangeInput} 
                      placeholder="Serial Number"  
                      type="text"
                      multiline={false}
                      rows={1}
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="flex items-center mt-3">
                  <div className="w-48">
                      <span>
                        Location
                      </span>
                  </div>
                  <div className="w-full max-w-lg">
                    <CustomTextField 
                      name="location" 
                      value={formData?.location}  
                      onChange={handleChangeInput} 
                      placeholder="Location / Room"  
                      type="text"
                      multiline={false}
                      rows={1}
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="flex items-center mt-3">
                  <div className="w-48">
                      <span>
                        Concern
                      </span>
                  </div>
                  <div className="w-full max-w-lg">
                    <CustomTextField 
                      placeholder="Please describe the issue you are experiencing." 
                      name="questions"
                      value={formData?.questions}
                      onChange={handleChangeInput}
                      type="tel"
                      multiline={true}
                      rows={3}
                      maxLength={255}
                      error={!!formError?.questions}         
                      helperText={formError?.questions}           
                    />
                  </div>
                </div>

                <div className="flex items-center mt-5">
                  <div className="w-48">
                      <span>
                        File Upload
                      </span>
                  </div>
                  <div className="w-full max-w-lg">
                    {/* File Upload Button */} 
                    <button 
                      type="button" 
                      onClick={() => setOpenUploadImageModal(true)} 
                      className="w-full p-4 border border-gray-300 bg-[#f5f5f5] rounded-[6px] text-gray-500 font-semibold">
                      {uploadedImages.length > 0 ? `${uploadedImages.length} File(s) Uploaded ✓` : "File Upload (Optional)"}
                    </button> 

                    {uploadedImages.length > 0 && (
                      <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                        <div className="relative">
                          {/* Main image display */}
                          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={uploadedImages[currentImageIndex]?.previewUrl || ''}
                              alt={`uploaded ${currentImageIndex + 1}`}
                              className="w-full h-full object-contain"
                            />

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(uploadedImages[currentImageIndex].id)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            {/* Navigation Arrows (only show if more than 1 image) */}
                            {uploadedImages?.length > 1 && (
                              <>
                                <button
                                  type='button'
                                  onClick={handlePrevImage}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                                >
                                  <ChevronLeft className="w-5 h-5"/>
                                </button>

                                <button
                                  type="button"
                                  onClick={handleNextImage}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                                >
                                  <ChevronRight className="w-5 h-5"/>
                                </button>
                              </>
                            )}

                            {/* Image Counter */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                              {currentImageIndex + 1} / {uploadedImages.length}
                            </div> 
                          </div>

                          {/* Thumbnail Navigation */}
                          {uploadedImages.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                              {uploadedImages.map((image, index) => (
                                <button
                                  key={image.id}
                                  type="button"
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentImageIndex
                                      ? 'border-yellow-500 scale-105'
                                      : 'border-gray-300 opacity-60 hover:opacity-100'
                                  }`}
                                >
                                  <img
                                    src={image.previewUrl || ''}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Image Info */}
                          <div className="mt-3 text-sm text-gray-600">
                            <p className="font-medium truncate">
                              {uploadedImages[currentImageIndex]?.file?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {((uploadedImages[currentImageIndex]?.file?.size || 0) / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default TicketForm
