import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  Home,
  Package,
  Phone,
  Mail,
  MessageSquare,
  Send,
  User2, 
  Building2
} from 'lucide-react';
import CustomTextField from '../../../../components/Fields/CustomTextField';
import CustomSelectField from '../../../../components/Fields/CustomSelectField' 
import TextsmsIcon from '@mui/icons-material/Textsms';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'; 
import { createConsultation } from '../../../../services/consultationServices'
import { useMutation } from '@tanstack/react-query' 

interface formData {
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  solution: string;
  message: string;
}

interface FormError {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  phone?: string;
  solution?: string;
  message?: string;
}

const ContactCTA = () => {
  const [formError, setFormError] = useState<FormError>({});
  const [formData, setFormData] = useState<formData>({
    name: '',
    email: '',
    company: '',
    role: '',
    phone: "",
    solution: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const roleOptions = [
    { value: 'cto', label: 'Chief Technology Officer' },
    { value: 'cio', label: 'Chief Information Officer' },
    { value: 'it-director', label: 'IT Director' },
    { value: 'procurement', label: 'Procurement Manager' },
    { value: 'operations', label: 'Operations Manager' },
    { value: 'other', label: 'Other' },
  ];

  const solutionOptions = [
    { value: 'charging_station', label: 'Charging Station' },
    { value: 'workspaces', label: 'Digital Workspaces' },
    { value: 'education', label: 'Educational Technology' },
    { value: 'wearables', label: 'Wearable Solutions' },
    { value: 'tablets', label: 'Tablet Solutions' },
    { value: 'kiosk', label: 'Kiosk' },
    { value: 'consultation', label: 'General Consultation' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };
 
  const validateForm = (): FormError => {
    const errors: FormError = {};
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.email.trim()) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format.';
    if (!formData.company.trim()) errors.company = 'Company is required.';
    if (!formData.role.trim()) errors.role = 'Role is required.';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required.';
    if (!formData.solution.trim()) errors.solution = 'Solution is required.';
    if (!formData.message.trim()) errors.message = 'Message is required.';
    return errors;
  };

  const mutation = useMutation({
    mutationFn: createConsultation,
    onSuccess: (data) => {
      console.log("Success:", data);
      setSubmitted(true);
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      console.error("Error:", error.message);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    setFormError(errors);
    if (Object.keys(errors).length > 0) return;

    // ✅ Start loading before mutation
    setIsSubmitting(true);

    try {
      await mutation.mutateAsync(formData); // trigger API call
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };


  return submitted ? (
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={40} className="text-white" />
          </div> 
          <h2 className="text-3xl lg:text-4xl bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent font-bold mb-4">Thank You for Your Interest!</h2>

          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Your inquiry has been received. Our solutions team will contact you within
            24 hours to discuss your requirements and schedule a personalized demonstration.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">What happens next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <Clock size={16} />
                <span>Initial consultation call within 24 hours</span>
              </div>
              <div className="flex items-center space-x-3">
                <FileText size={16} />
                <span>Customized proposal within 3-5 business days</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar size={16} />
                <span>Live demo scheduled at your convenience</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <button className="flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-lg font-semibold">
                <Home size={20} /> Return to Homepage
              </button>
            </Link>

            <Link to="/products">
              <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-700 hover:from-yellow-300 hover:to-amber-600 px-6 py-3 rounded-lg font-semibold">
                <Package size={20} /> Explore Products
              </button>
            </Link>
          </div>
        </div>
      </section>
  ) : (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
              Ready to Transform {' '}
              <span className="block bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Your Organization?
              </span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Let our experts help you choose the perfect solution for your unique needs. Schedule a consultation or request a custom quote today.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Phone className="text-accent" />
              </div>
              <div>
                <div className="font-semibold">Sales</div>
                <div className="text-gray-300">+63 912 345 6789</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-conversion-accent/20 rounded-lg flex items-center justify-center">
                <Mail className="text-conversion-accent" />
              </div>
              <div>
                <div className="font-semibold">Support</div>
                <div className="text-gray-300">info@beese.ph</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-green-400" />
              </div>
              <div>
                <div className="font-semibold">Live Chat Support</div>
                <div className="text-gray-300">Available 24/7 for clients</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Form) */}
        <div className="bg-white rounded-2xl p-8 shadow-xl text-gray-800">
          <h3 className="text-2xl font-bold mb-6 text-yellow-400">
            Request Consultation
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <CustomTextField
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                icon={<User2 />}
                rows={1}
                maxLength={100}
                type='text'
                multiline={false}
                error={!!formError.name}
                helperText={formError.name}
              />
              <CustomTextField
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                rows={1}
                maxLength={100}
                type='text'
                multiline={false}
                icon={<Mail />}
                error={!!formError.email}
                helperText={formError.email}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <CustomTextField
                name="company"
                placeholder="Enter company name"
                value={formData.company}
                onChange={handleInputChange}
                icon={<Building2 />}
                error={!!formError.company}
                helperText={formError.company}
                type='text'
                multiline={false}
                rows={1}
                maxLength={100}
              />

              <CustomSelectField
                name="role"
                value={formData.role}
                placeholder="Select your role"
                options={roleOptions}
                onChange={handleInputChange}
                error={!!formError.role}
                helperText={formError.role}
              />
            </div>

            <CustomTextField
                name="phone"
                placeholder="09XXXXXXXXX"
                value={formData.phone}
                onChange={handleInputChange}
                multiline={false}
                maxLength={11}
                type="tel"
                rows={1}
                icon={<Phone className="w-4 h-4" />}
                error={!!formError.phone}
                helperText={formError.phone}
              />

            <CustomSelectField
              name="solution"
              value={formData.solution}
              placeholder="Select a solution"
              options={solutionOptions}
              onChange={handleInputChange}
              error={!!formError.solution}
              helperText={formError.solution}
            />

            <CustomTextField
              name="message"
              placeholder="Tell us about your requirements..."
              value={formData.message}
              onChange={handleInputChange}
              multiline={true}
              maxLength={2550}
              rows={4}
              type='text'
              icon={<TextsmsIcon />}
              error={!!formError.message}
              helperText={formError.message}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500  text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Submitting...</span>
              ) : (
                <>
                  <Send size={20} /> Submit Inquiry
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center">
            By submitting this form, you agree to our{' '}
            <Link to="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/terms" className="text-accent hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
};

export default ContactCTA;
