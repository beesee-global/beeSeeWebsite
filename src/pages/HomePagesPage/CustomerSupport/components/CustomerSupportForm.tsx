import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { motion } from 'framer-motion';

import PersonIcon from '@mui/icons-material/Person';
import TextsmsIcon from '@mui/icons-material/Textsms'; 
import { Email } from '@mui/icons-material';
import { 
  Lock, 
  Send, 
  ThumbsUp, 
  Phone ,
  MapPin
} from 'lucide-react';

import CustomTextField from '../../../../components/Fields/CustomTextField';
import CustomSelectField from '../../../../components/Fields/CustomSelectField'; 
import ImageUploadModal from './ImageUploadModal';
import Snackbar from '../../../../components/feedback/Snackbar'; 
import { AlertColor } from '@mui/material/Alert';
import { 
  useMutation,
  useQuery, 
} from '@tanstack/react-query';
import { 
  createCustomerSupport, 
  fetchDevice 
} from '../../../../services/Ecommerce/customerSupportServices'

interface CustomerType {
  first_name: string;
  last_name: string;
  category_id: string; 
  email: string; 
  type: string;
  organization: string;
  address: string;
  contact_number: string;
  concern: string;
}  
interface ImageData {
  file: File | null;
  base64: string | null;
  previewUrl: string | null;
}

interface FormError {
  first_name?: string;
  last_name?: string;
  category_id?: string; 
  address?: string;
  email?: string; 
  concern?: string;
  contact_number?: string;
  organization?: string;
  type?: string;
}

const CustomerSupportForm = () => {
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [formError, setFormError] = useState<FormError>({}); 
  const [message, setMessage] = useState('');
  const [snackBarType, setSnackBarType] = useState<AlertColor>('success');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<ImageData>({
    file: null,
    base64: null,
    previewUrl: null,
  });
  const [openUploadModal, setOpenUploadModal] = useState<boolean>(false);

  const organization= [ 
    { value: 'rfgs', label: 'RFGS' }, 
    { value: 'client', label: 'Client' }, 
  ]

  const requestType = [ 
    { value: 'Warranty Repair', label: 'Warranty / Request Repair' },
    { value: 'Technical Support', label: 'Technical Support' },
  ];

  const [formData, setFormData] = useState<CustomerType>({
    first_name: '',
    last_name: '', 
    category_id: '',
    email: '', 
    concern: '',
    address: '',
    contact_number: '',
    organization: '',
    type: '',
  });

  // === Framer Motion Variants ===
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, duration: 0.8 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const mutation = useMutation({
    mutationFn: createCustomerSupport,

    onSuccess: () => {
      setMessage("Form submitted successfully!");
      setSnackBarType("success");
      setShowAlert(true);
      handleClearForm();
      setUploadedImage({ file: null, base64: null, previewUrl: null });
      setCaptchaValue(null);
    },

    onError: (error: any) => {
      console.error("❌ Customer Support Error:", error);
      setMessage("Failed to submit form. Please try again.");
      setSnackBarType("error");
      setShowAlert(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaValue) {
      setMessage("Please verify the reCAPTCHA.");
      setSnackBarType("error");
      setShowAlert(true);
      return;
    }

    const errors = validateForm();
    setFormError(errors);

    if (Object.keys(errors).length === 0) {
      const formDataToSend = new FormData();

      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append image file (if any)
      if (uploadedImage.file) { 
        formDataToSend.append("image", uploadedImage.file);
      }

      mutation.mutate(formDataToSend);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => 
      ({ ...prev, 
        [name]: value }));

    setFormError((prev) => ({ 
      ...prev, 
      [name]: undefined 
    }));
  };

  const validateForm = (): FormError => {
    const errors: FormError = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name is required.';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required.'; 
    if (!formData.category_id) errors.category_id = 'Device is required.';
    if (!formData.email.trim()) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format.';
    if (!formData.contact_number.trim()) errors.contact_number = 'Phone number is required.';
    else if (!/^09\d{9}$/.test(formData.contact_number)) errors.contact_number = 'Phone number must start with 09 and be 11 digits long.';
    if (!formData.organization.trim()) errors.organization = 'Organization is required.';
    if (!formData.type.trim()) errors.type = 'Type is required.';
    if (!formData.address.trim()) errors.address = 'Address is required.';
    if (!formData.concern.trim()) errors.concern = 'Concern is required.';
    return errors;
  };

  const handleImageSubmit = (file: File | null, base64?: string) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage({ file, base64: base64 || null, previewUrl });
    } else {
      setUploadedImage({ file: null, base64: null, previewUrl: null }); 
    }
  };

  const handleClearForm = () => {
    setFormData({
      first_name: '',
      last_name: '', 
      category_id: '',
      email: '',
      contact_number: '',
      concern: '',
      organization: '',
      type: '',
      address: '',
    })
  }

  // fetch devices
  const {
    data: Devices = [], 
  } = useQuery({
    queryKey: ['devices'],
    queryFn: () => fetchDevice(),
    select: (data) => {
      // Map API result into label/value pairs
      const mapped = data.map((item: { id: number; name: string }) => ({
        value: item.id,   // ✅ foreign key (number)
        label: item.name, // ✅ user-friendly name
      }));

      // Optionally add an "Others" option at the end
      mapped.push({ value: 'others', label: 'Others' });
      return mapped;
    },
  })

  return (
    <div className="flex items-center justify-center bg-gray-100 p-6">
      <Snackbar 
        open={showAlert} 
        type={snackBarType} 
        message={message} 
        onClose={() => setShowAlert(false)} 
      />

      <ImageUploadModal 
        open={openUploadModal} 
        onClose={() => setOpenUploadModal(false)} 
        onSubmit={handleImageSubmit} 
      />

      {/* ✨ Animated Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white shadow-lg rounded-2xl p-8 md:px-[150px] w-full max-w-4xl"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center">
          <h2 className="text-[#c0a404] text-xl font-semibold">BEESEE Support Center</h2>
          <h1 className="text-5xl font-bold mb-4 text-center mt-7 text-[#e9c811]">TECHNICAL SUPPORT</h1>
          <h3 className="text-md mt-4 lg:text-xl text-gray-700">Get expert technical support from our BEESEE team</h3>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4 mt-5"
        >
          <motion.div variants={itemVariants}>
            <CustomTextField
              name="first_name"
              placeholder="First name"
              value={formData.first_name}
              onChange={handleInputChange}
              multiline={false}
              type="text"
              rows={1}
              maxLength={100}
              icon={<PersonIcon className="w-4 h-4" />}
              error={!!formError.first_name}
              helperText={formError.first_name}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CustomTextField
              name="last_name"
              placeholder="Last name"
              value={formData.last_name}
              onChange={handleInputChange}
              multiline={false}
              type="text"
              rows={1}
              maxLength={100}
              icon={<PersonIcon className="w-4 h-4" />}
              error={!!formError.last_name}
              helperText={formError.last_name}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CustomSelectField
              name="type"
              placeholder="Request Type"
              value={formData.type}
              onChange={handleInputChange}
              options={requestType}
              error={!!formError.type}
              helperText={formError.type}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CustomSelectField
              name="organization"
              value={formData.organization}
              options={organization}
              onChange={handleInputChange}
              placeholder="Select a organization"
              error={!!formError.organization}
              helperText={formError.organization}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CustomSelectField
              name="category_id"
              value={formData.category_id}
              options={Devices}
              onChange={handleInputChange}
              placeholder="Select a Device"
              error={!!formError.category_id}
              helperText={formError.category_id}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CustomTextField
              name="email"
              placeholder="Email"
              value={formData.email}
              multiline={false}
              rows={1}
              maxLength={100}
              onChange={handleInputChange}
              icon={<Email className="w-4 h-4"/>}
              type="email"
              error={!!formError.email}
              helperText={formError.email}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CustomTextField
              name="contact_number"
              placeholder="09XXXXXXXXX"
              value={formData.contact_number}
              onChange={handleInputChange}
              multiline={false}
              maxLength={11}
              type="tel"
              rows={1}
              icon={<Phone className="w-4 h-4" />}
              error={!!formError.contact_number}
              helperText={formError.contact_number}
            /> 
          </motion.div>

          <motion.div variants={itemVariants}>
            <CustomTextField
              name="address"
              placeholder=".(e.g., House No., Street, City, Province, Zip Code)"
              value={formData.address}
              multiline={true}
              rows={2}
              type="text"
              maxLength={150}
              onChange={handleInputChange}
              icon={<MapPin className="w-4 h-4"/>}
              error={!!formError.address}
              helperText={formError.address}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CustomTextField
              name="concern"
              placeholder="Tell us about your concern and issue..."
              value={formData.concern}
              multiline={true}
              rows={4}
              type="text"
              maxLength={2550}
              onChange={handleInputChange}
              icon={<TextsmsIcon className="w-4 h-4"/>}
              error={!!formError.concern}
              helperText={formError.concern}
            />
          </motion.div>

          {/* File upload */}
          <motion.div variants={itemVariants}>
            <div
              onClick={() => setOpenUploadModal(true)}
              className="w-full text-center p-4 border border-gray-300 bg-[#f5f5f5] rounded-[6px] cursor-pointer text-gray-500 hover:text-gray-700 hover:border-gray-700 font-semibold"
            >
              {uploadedImage.file ? 'File Uploaded ✓' : 'File Upload (Optional)'}
            </div>
          </motion.div>

          {/* reCAPTCHA */}
          <motion.div variants={itemVariants} className="w-full flex items-center justify-center">
            <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY as string} onChange={setCaptchaValue} />
          </motion.div>

          {/* Submit */}
          <motion.div variants={itemVariants}>
            <button
              type="submit"
              disabled={mutation.isPending}
              className={`w-full mt-10 bg-gradient-to-r from-[#FCD000] to-[#FFD700] 
                text-xl text-gray-700 font-semibold py-4 rounded-lg shadow-md 
                hover:scale-[1.02] transition-transform duration-300 ease-in-out 
                ${mutation.isPending ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {mutation.isPending ? "Submitting..." : "SUBMIT TO BEESEE SUPPORT"}
            </button>
          </motion.div>
        </motion.form>

        {/* Footer */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 w-full mt-10">
          <h4 className="text-[15px]">
            Powered by <span className="font-semibold text-[#F3C623]">BEESEE</span> Global Technologies Inc
          </h4>
          <div className="flex items-center justify-center gap-4 text-[12px] text-gray-600">
            <p className="flex items-center gap-2">
              <Lock size={15} /> Secure & Confidential
            </p>
            <p className="flex items-center gap-2">
              <Send size={15} /> Fast Response
            </p>
            <p className="flex items-center gap-2">
              <ThumbsUp size={15} /> Expert Solutions
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CustomerSupportForm;
