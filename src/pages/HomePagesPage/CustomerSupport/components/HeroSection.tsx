import React, { useState, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import CustomTextField from '../../../../components/Fields/CustomTextField';
import CustomSelectField from '../../../../components/Fields/CustomSelectField';
import CustomTextFieldAutoCamelCase from '../../../../components/Fields/CustomTextFieldAutoCamelCase';
import ImageUploadModal from './ImageUploadModal';
import CustomerSupportModal from './CustomerSupportModal';
import { userAuth } from '../../../../hooks/userAuth';
import { 
    fetchDevices, 
    fetchCategory, 
    fetchIssue, 
    createCustomerSupport, 
    images,  
} from '../../../../services/Technician/customerSupportServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import PersonIcon from '@mui/icons-material/Person';
import { Building2, Mail, Phone, MessageCircleQuestion, Send, CheckCircle, Barcode, Landmark, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react'; 
import Disclaimer from '../../../../components/feedback/Disclaimer';

interface CustomerIssue {
    full_name: string;
    company: string;
    city: string;
    email: string;
    item_name?: string;
    contact_number: string;
    location: string;
    category_id: string;
    is_active: string;
    device_id: string;
    issue_id: string;
    questions: string;
    serial_number: string;
}

interface ImageData {
    id: string;
    file: File | null;
    base64: string | null;
    previewUrl: string | null;
}

interface FormError {
    full_name?: string;
    company?: string;
    city?: string;
    email?: string;
    location?: string;
    item_name?: string;
    contact_number?: string;
    category_id?: string;
    device_id?: string;
    issue_id?: string;
    questions?: string;
    file_upload?: string;
}

const HeroSection: React.FC = () => {
    const { 
      setSnackBarOpen, 
      setSnackBarMessage, 
      setSnackBarType,  
    } = userAuth();

    const [captchaValue, setCaptchaValue] = useState<string | null>(null);
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    const [formData, setFormData] = useState<CustomerIssue>({
        full_name: '',
        company: '',
        city: '',
        email: '',
        contact_number: '',
        category_id: '',
        location: '',
        item_name: '',
        is_active: '',
        device_id: '',
        issue_id: '',
        questions: '',
        serial_number: '',
    });

    const [formError, setFormError] = useState<FormError>({});
    const [openUploadImageModal, setOpenUploadImageModal] = useState<boolean>(false);
    const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);

    // === Queries ===
    const { data: categoryResponse = [] } = useQuery({
      queryKey: ['categories'],
      queryFn: fetchCategory,
      select: (res) =>
        res.data.map((item: any) => ({
            value: String(item.id),
            label: item.name,
            is_active: item.is_active,
        })),
    });

    const { data: productResponse = [] } = useQuery({
      queryKey: ['device', formData?.category_id],
      queryFn: () => fetchDevices(Number(formData?.category_id)),
      enabled: !!formData?.category_id,
      select: (res) => {
          const mapped = res.data.map((item: any) => ({
              value: item.id,
              label: item.product_name,
          }));
          return mapped;
      },
    });

    const { data: issueResponse = [] } = useQuery({
      queryKey: ['issues', formData?.device_id],
      queryFn: () => fetchIssue(Number(formData?.device_id)),
      enabled: !!formData?.device_id,
      select: (res) => {
          const mapped = res.data.map((item: any) => ({
              value: item.id,
              label: item.name,
          }));
          return mapped;
      },
    });

    /* inserting data */
    const { 
      mutateAsync: createEmployeeMutate, 
      isPending: isCreating 
    } = useMutation({
      mutationFn: createCustomerSupport,
    });

    const { 
      mutateAsync: insertImage, 
      isPending: isCreatingImage 
    } = useMutation({
      mutationFn: images,
    });

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name === 'category_id') {
        const selectedCategory = categoryResponse.find((item: any) => item.value === String(value));
        setFormData((prev) => ({
            ...prev!,
            category_id: String(value),
            is_active: selectedCategory?.is_active ?? '',
        }));
      } else {
        setFormData((prev) => ({ ...prev!, [name]: value }));
      }
      setFormError((prev) => ({ ...prev!, [name]: undefined }));
    };

    const handleImageSubmit = (file: File | null, base64?: string) => {
      if (file) {
        const newImage: ImageData = {
          id: Date.now().toString(),
          file,
          base64: base64 || null,
          previewUrl: URL.createObjectURL(file),
        };
        setUploadedImages((prev) => [...prev, newImage]);
        setFormError((prev) => ({ ...prev, file_upload: undefined }));
      }
  };

    const handleRemoveImage = (id: string) => {
      const remainingImages = uploadedImages.filter((img) => img.id !== id);
      setUploadedImages(remainingImages);
      if (currentImageIndex >= remainingImages.length) {
        setCurrentImageIndex(Math.max(0, remainingImages.length - 1));
      }
      if (remainingImages.length === 0) {
        setFormError((prev) => ({ ...prev, file_upload: 'Please upload at least one image.' }));
      }
    };

    const handlePrevImage = () => {
      setCurrentImageIndex((prev) => (prev === 0 ? uploadedImages.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
      setCurrentImageIndex((prev) => (prev === uploadedImages.length - 1 ? 0 : prev + 1));
    };

    const validateStep = (): FormError => {
        const errors: FormError = {};
        if (!formData?.full_name.trim()) errors.full_name = 'Full name is required.';
        if (!formData?.company.trim()) errors.company = 'Company / Institution Name is required.';
        if (!formData?.city.trim()) errors.city = 'City is required.';
        if (!formData?.email.trim()) errors.email = 'Email is required.';
        if(!formData?.location.trim()) errors.location = "Location / room is required."
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid format.';

        if (!formData?.contact_number.trim()) errors.contact_number = 'Phone number is required.';
        else if (!/^09\d{9}$/.test(formData.contact_number)) errors.contact_number = 'Phone number must start with 09 and be 11 digits long.';

        if (!formData?.category_id) errors.category_id = 'Device is required.';
        if (formData?.is_active === 'false') {
            if (!formData?.device_id) errors.device_id = 'Model is required.';
            if (!formData?.issue_id) errors.issue_id = 'Issue type is required';
        } else {
            if (!formData?.item_name?.trim()) errors.item_name = 'Item name is required';
        }
        if (!formData?.questions.trim()) errors.questions = 'Please provide details about your issue.';
        if (uploadedImages.length === 0) errors.file_upload = 'Please upload at least one image.';
        return errors;
    };

    const handleSubmit = async () => {
        try {
            const ticketsDetails: any = {
                categories_id: formData?.category_id,
                issues_id: formData?.issue_id,
                products_id: formData?.device_id,
                serial_number: formData?.serial_number,
                item_name: formData?.item_name,
                status: 'open',
                questions: formData?.questions,
            };

            const payload: any = {
                full_name: formData?.full_name,
                company: formData?.company,
                city: formData?.city,
                email: formData?.email,
                phone: formData?.contact_number,
                location: formData?.location
            };

            payload.tickets_details = ticketsDetails;

            const response = await createEmployeeMutate(payload);

            if (uploadedImages.length > 0) {
                for (const image of uploadedImages) {
                    if (image.file) {
                        const formDataImage = new FormData();
                        formDataImage.append('image', image.file);
                        await insertImage({ id: response.data.ticket_id, image: formDataImage });
                    }
                }
            }

            setFormData({
                full_name: '',
                company: '',
                city: '',
                email: '',
                item_name: '',
                contact_number: '',
                category_id: '',
                is_active: '',
                device_id: '',
                issue_id: '',
                location: '',
                serial_number: '',
                questions: '',
            });

            setUploadedImages([]);
            setCurrentImageIndex(0);
            setCaptchaValue(null);
            setIsSubmitted(true);
        } catch (error) {
            setSnackBarMessage('Failed to submit, Please try again.');
            setSnackBarType('error');
            setSnackBarOpen(true);
        }
    };

    useEffect(() => {
        if (formData?.category_id) {
            setFormData((prev) => ({
                ...prev!,
                device_id: '',
                issue_id: '',
            }));
        }
    }, [formData?.category_id]);

    useEffect(() => {
        if (formData?.device_id) {
            setFormData((prev) => ({
                ...prev!, 
                issue_id: '',
            }));
        }
    }, [formData?.device_id]);

    const handleBeforeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateStep();
        setFormError(errors);

        if (Object.keys(errors).length === 0) {
            if (!captchaValue) {
                setSnackBarMessage('Please verify the reCAPTCHA.');
                setSnackBarType('error');
                setSnackBarOpen(true);
                return;
            }

            setOpenModal(true);
        } else {
            setSnackBarMessage('Please fill in all required fields.');
            setSnackBarType('error');
            setSnackBarOpen(true);
        }
    };

    const handleModalSubmit = () => {
        setOpenModal(false);
        setShowDisclaimer(true);
    };

    const handleProceedDisclaimer = async () => {
        setShowDisclaimer(false);
        await handleSubmit();
    };

    const handleCancelDisclaimer = () => {
        setShowDisclaimer(false);
    };

    const selectedCategoryLabel = categoryResponse.find((item: any) => item.value === String(formData?.category_id))?.label || '';
    const selectedDeviceLabel = productResponse.find((item: any) => String(item.value) === String(formData?.device_id))?.label || '';
    const selectedIssueLabel = issueResponse.find((item: any) => String(item.value) === String(formData?.issue_id))?.label || '';

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Modal Component */}
            <CustomerSupportModal
                open={openModal}
                isSubmitting={isCreating || isCreatingImage}
                formData={formData}
                categoryLabel={selectedCategoryLabel}
                deviceLabel={selectedDeviceLabel}
                issueLabel={selectedIssueLabel}
                uploadedImages={uploadedImages}
                onCancel={() => setOpenModal(false)}
                onSubmit={handleModalSubmit}
            />
            <Disclaimer open={showDisclaimer} onCancel={handleCancelDisclaimer} onProceed={handleProceedDisclaimer} />

            {/* Fixed Background */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url('/live-background/download.jpeg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="absolute inset-0 bg-[#000000]/50" />
                {/* GOLD + BLACK FADE LAYERS */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        background: `
              /* Top black fade */
              linear-gradient(
                to bottom,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,0.85) 5%,
                rgba(0,0,0,0.55) 25%,
                rgba(0,0,0,0.25) 40%,
                rgba(0,0,0,0.08) 60%,
                rgba(0,0,0,0) 100%
              ),
              /* Bottom gold/yellow fade */
              linear-gradient(
                to bottom,
                rgba(253,204,0,0.35) 0%,
                rgba(253,204,0,0.25) 15%,
                rgba(253,204,0,0.15) 35%,
                rgba(253,204,0,0.08) 55%,
                rgba(253,204,0,0.03) 75%,
                rgba(253,204,0,0) 100%
              ),
              linear-gradient(
                to top,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,0.85) 5%,
                rgba(0,0,0,0.55) 25%,
                rgba(0,0,0,0.25) 40%,
                rgba(0,0,0,0.08) 78%,
                rgba(0,0,0,0) 100%
              )
            `,
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10">
                 
                <ImageUploadModal 
                    open={openUploadImageModal} 
                    onClose={() => setOpenUploadImageModal(false)} 
                    onSubmit={handleImageSubmit} 
                />

                {/* HERO SECTION - Reduced top padding for mobile */}
                <section className="pt-19 sm:pt-28 md:pt-36 pb-10 sm:pb-16 md:pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.7 }}
                                className="bee-title-lg text-[#FDCC00] leading-[0.9] tracking-wide select-none px-4 mb-6 text-center drop-shadow-md break-words"
                            >
                                CONNECT WITH OUR TECHNICAL SPECIALISTS
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.7 }}
                                className="bee-body-lg text-[#C7B897] max-w-3xl mx-auto px-2 sm:px-0"
                            >
                                Get expert consultation, technical support, and custom solutions from our team of specialists.
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* FORM SECTION - Adjusted for mobile */}
                <div className="flex justify-center w-full pb-10 sm:pb-16 md:pb-20">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="px-4 sm:px-6 w-full max-w-3xl">
                        {isSubmitted ? (
                            <motion.section
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6 }}
                                className="py-12 sm:py-16 md:py-20 beesee-card-content"
                            >
                                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8"
                                        style={{
                                            background: 'rgba(253, 204, 0, 0.15)',
                                            border: '2px solid var(--beesee-gold)',
                                        }}
                                    >
                                        <CheckCircle size={40} style={{ color: 'var(--beesee-gold)' }} />
                                    </motion.div>

                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="bee-title-md text-[var(--beesee-gold)] mb-3 sm:mb-4"
                                    >
                                        Thank You for Reporting Your Issue
                                    </motion.h2>

                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="bee-body-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto"
                                    >
                                        Your form has been successfully submitted. We will contact you as soon as possible to resolve your issue.
                                    </motion.p>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-2xl mx-auto"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(253, 204, 0, 0.2)',
                                        }}
                                    >
                                        <h3 className="bee-title-sm text-white mb-4 sm:mb-6">Next Steps</h3>
                                        <div className="space-y-3 sm:space-y-4 text-left">
                                            {[
                                                { icon: Mail, text: 'You will receive an email confirmation with your ticket details' },
                                                { icon: Phone, text: 'If needed, a support representative will contact you for clarification' },
                                                { icon: CheckCircle, text: 'Issue will be resolved or updated as soon as possible' },
                                            ].map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.6 + index * 0.1 }}
                                                    className="flex items-center space-x-3"
                                                >
                                                    <item.icon size={16} className="text-[var(--beesee-gold)] flex-shrink-0" />
                                                    <span className="bee-body-sm text-white/80">{item.text}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                                        <button onClick={() => setIsSubmitted(false)} className="beesee-button py-2 sm:py-3 px-4 sm:px-6">
                                            <Send size={18} className="mr-2" /> Submit Another Issue
                                        </button>
                                    </motion.div>
                                </div>
                            </motion.section>
                        ) : (
                            <div className="beesee-card-content p-4 sm:p-6 md:p-8">
                                <div className="space-y-4 sm:space-y-5">
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                        <CustomTextFieldAutoCamelCase
                                            placeholder="Name"
                                            name="full_name"
                                            value={formData?.full_name}
                                            onChange={handleChangeInput}
                                            type="text"
                                            multiline={false}
                                            rows={1}
                                            maxLength={100}
                                            icon={<PersonIcon sx={{ fontSize: 18 }} />}
                                            error={!!formError?.full_name}
                                            helperText={formError?.full_name}
                                        />
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                        <CustomTextFieldAutoCamelCase
                                            placeholder="Company / Institution Name"
                                            name="company"
                                            value={formData?.company}
                                            onChange={handleChangeInput}
                                            type="text"
                                            multiline={false}
                                            rows={1}
                                            maxLength={100}
                                            icon={<Building2 className="w-4 h-4" />}
                                            error={!!formError?.company}
                                            helperText={formError?.company}
                                        />
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                        <CustomTextFieldAutoCamelCase
                                            placeholder="City"
                                            name="city"
                                            value={formData?.city}
                                            onChange={handleChangeInput}
                                            type="text"
                                            multiline={false}
                                            rows={1}
                                            maxLength={100}
                                            icon={<Landmark className="w-4 h-4" />}
                                            error={!!formError?.city}
                                            helperText={formError?.city}
                                        />
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                        <CustomTextField
                                            placeholder="Email"
                                            name="email"
                                            value={formData?.email}
                                            onChange={handleChangeInput}
                                            type="text"
                                            multiline={false}
                                            rows={1}
                                            maxLength={100}
                                            icon={<Mail className="w-4 h-4" />}
                                            error={!!formError?.email}
                                            helperText={formError?.email}
                                        />
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                        <CustomTextField
                                            placeholder="09XXXXXXXXX"
                                            name="contact_number"
                                            value={formData?.contact_number}
                                            onChange={handleChangeInput}
                                            type="tel"
                                            multiline={false}
                                            rows={1}
                                            maxLength={11}
                                            icon={<Phone className="w-4 h-4" />}
                                            error={!!formError?.contact_number}
                                            helperText={formError?.contact_number}
                                        />
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                                        <CustomSelectField
                                            name="category_id"
                                            value={formData?.category_id}
                                            options={categoryResponse}
                                            onChange={handleChangeInput}
                                            placeholder="Select a Device Type"
                                            error={!!formError?.category_id}
                                            helperText={formError?.category_id}
                                        />
                                    </motion.div>
                                </div>

                                {formData?.category_id !== '' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="space-y-4 sm:space-y-5 mt-4 sm:mt-5"
                                    >
                                        {formData?.is_active === 'false' ? (
                                            <div className='space-y-4'>
                                                <CustomSelectField
                                                    name="device_id"
                                                    value={formData?.device_id}
                                                    options={productResponse}
                                                    onChange={handleChangeInput}
                                                    placeholder="Select a Model"
                                                    error={!!formError?.device_id}
                                                    helperText={formError?.device_id}
                                                />

                                                <CustomSelectField
                                                    name="issue_id"
                                                    value={formData?.issue_id}
                                                    options={issueResponse}
                                                    onChange={handleChangeInput}
                                                    placeholder="Select a Issue Type"
                                                    error={!!formError?.issue_id}
                                                    helperText={formError?.issue_id}
                                                />
                                            </div>
                                        ) : (
                                          <CustomTextField
                                            placeholder="Item name"
                                            name="item_name"
                                            value={formData?.item_name}
                                            onChange={handleChangeInput}
                                            type="text"
                                            multiline={false}
                                            rows={1}
                                            maxLength={100}
                                            icon={<PersonIcon sx={{ fontSize: 18 }} />}
                                            error={!!formError?.item_name}
                                            helperText={formError?.item_name}
                                          />
                                        )}

                                        <CustomTextField
                                            placeholder="Serial Number"
                                            name="serial_number"
                                            value={formData?.serial_number}
                                            onChange={handleChangeInput}
                                            type="text"
                                            multiline={false}
                                            rows={1}
                                            maxLength={100}
                                            icon={<Barcode sx={{ fontSize: 18 }} />}
                                        />

                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                            <CustomTextFieldAutoCamelCase
                                                placeholder="Location / Room"
                                                name="location"
                                                value={formData?.location}
                                                onChange={handleChangeInput}
                                                type="text"
                                                multiline={false}
                                                rows={1}
                                                maxLength={100}
                                                icon={<Landmark className="w-4 h-4" />}
                                                error={!!formError?.location}
                                                helperText={formError?.location}
                                            />
                                        </motion.div>

                                        <CustomTextFieldAutoCamelCase
                                            name="questions"
                                            value={formData?.questions}
                                            onChange={handleChangeInput}
                                            placeholder="Please describe the issue you are experiencing."
                                            rows={3}
                                            type="text"
                                            multiline={true}
                                            maxLength={500}
                                            icon={<MessageCircleQuestion className="w-4 h-4" />}
                                            error={!!formError?.questions}
                                            helperText={formError?.questions}
                                        />

                                        <div className='text-left'>
                                            <p className='text-white'>Note Kindly attach a picture to help us provide a better solution.</p>
                                        </div>
                                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                            <button
                                                type="button"
                                                onClick={() => setOpenUploadImageModal(true)}
                                                className="w-full p-3 sm:p-4 border-2 border-dashed rounded-lg transition-all duration-300"
                                                style={{
                                                    borderColor: uploadedImages.length > 0 ? 'var(--beesee-gold)' : 'rgba(199, 184, 151, 0.3)',
                                                    background: uploadedImages.length > 0 ? 'rgba(253, 204, 0, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                                    color: uploadedImages.length > 0 ? 'var(--beesee-gold)' : '#C7B897',
                                                }}
                                            >
                                                <span className="bee-body-sm font-semibold">
                                                    {uploadedImages.length > 0 ? `${uploadedImages.length} File(s) Uploaded ✓` : 'File Upload'}
                                                </span>
                                            </button>
                                        </motion.div>
                                        {formError?.file_upload && (
                                            <p className="text-red-400 text-sm mt-1">{formError.file_upload}</p>
                                        )}

                                        {uploadedImages.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="mt-3 sm:mt-4 rounded-lg p-3 sm:p-4"
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                    border: '1px solid rgba(253, 204, 0, 0.2)',
                                                }}
                                            >
                                                <div className="relative">
                                                    <div className="relative aspect-video bg-black/30 rounded-lg overflow-hidden">
                                                        <img
                                                            src={uploadedImages[currentImageIndex]?.previewUrl || ''}
                                                            alt={`Uploaded ${currentImageIndex + 1}`}
                                                            className="w-full h-full object-contain"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(uploadedImages[currentImageIndex].id)}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 sm:p-2 rounded-full hover:bg-red-600 transition-colors"
                                                        >
                                                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        </button>

                                                        {uploadedImages.length > 1 && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={handlePrevImage}
                                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 text-white p-1 sm:p-2 rounded-full hover:bg-black/90 transition-all"
                                                                >
                                                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleNextImage}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 text-white p-1 sm:p-2 rounded-full hover:bg-black/90 transition-all"
                                                                >
                                                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                </button>
                                                            </>
                                                        )}

                                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2 py-1 rounded-full bee-body-sm">
                                                            {currentImageIndex + 1} / {uploadedImages.length}
                                                        </div>
                                                    </div>

                                                    {uploadedImages.length > 1 && (
                                                        <div className="flex gap-2 mt-2 sm:mt-3 overflow-x-auto pb-2">
                                                            {uploadedImages.map((image, index) => (
                                                                <button
                                                                    key={image.id}
                                                                    type="button"
                                                                    onClick={() => setCurrentImageIndex(index)}
                                                                    className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                                        index === currentImageIndex ? 'border-[var(--beesee-gold)] scale-105' : 'border-gray-600 opacity-60 hover:opacity-100'
                                                                    }`}
                                                                >
                                                                    <img src={image.previewUrl || ''} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="mt-2 sm:mt-3 bee-body-sm text-[#C7B897]">
                                                        <p className="font-medium truncate">{uploadedImages[currentImageIndex]?.file?.name}</p>
                                                        <p className="opacity-70">{((uploadedImages[currentImageIndex]?.file?.size || 0) / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-center scale-90 sm:scale-100">
                                            <ReCAPTCHA 
                                                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY as string} 
                                                onChange={setCaptchaValue} 
                                            />
                                        </motion.div>

                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                            <button type="button" disabled={isCreating || isCreatingImage} onClick={handleBeforeSubmit} className="beesee-button w-full py-2 sm:py-3">
                                                {isCreating || isCreatingImage ? (
                                                    <span className="animate-pulse">Submitting...</span>
                                                ) : (
                                                    <>
                                                        <Send size={18} className="mr-2" /> Submit
                                                    </>
                                                )}
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
