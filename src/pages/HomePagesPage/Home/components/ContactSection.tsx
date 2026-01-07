import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
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

const ContactSection = () => {
  const [isMobile, setIsMobile] = useState(false);
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

  // Animation refs
  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const rightColumnRef = useRef<HTMLDivElement | null>(null);
  const inViewLeft = useInView(leftColumnRef, { amount: 0.25, once: isMobile });
  const inViewRight = useInView(rightColumnRef, { amount: 0.25, once: isMobile });

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Slide-in animation effect
  useEffect(() => {
    const section = document.getElementById('contact-section');
    if (section) {
      section.classList.add('fade-up');
    }
  }, []);

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

    setIsSubmitting(true);

    try {
      await mutation.mutateAsync(formData);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return submitted ? (
    <section 
      id="contact-section"
      className="py-24 bg-[#000000] text-white fade-up-init"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{
              background: 'rgba(253, 204, 0, 0.15)',
              border: '2px solid var(--beesee-gold)'
            }}
          >
            <CheckCircle size={40} style={{ color: 'var(--beesee-gold)' }} />
          </div>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bee-title-md"
          style={{ color: 'var(--beesee-gold)', marginBottom: '1.5rem' }}
        >
          Thank You for Your Interest!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bee-body"
          style={{ marginBottom: '2rem', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}
        >
          Your inquiry has been received. Our solutions team will contact you within
          24 hours to discuss your requirements and schedule a personalized demonstration.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="rounded-2xl p-6 mb-8 max-w-2xl mx-auto"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(253, 204, 0, 0.22)'
          }}
        >
          <h3 className="bee-title-sm" style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
            What happens next?
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <Clock size={16} style={{ color: 'var(--beesee-gold)' }} />
              <span className="bee-body-sm">Initial consultation call within 24 hours</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText size={16} style={{ color: 'var(--beesee-gold)' }} />
              <span className="bee-body-sm">Customized proposal within 3-5 business days</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar size={16} style={{ color: 'var(--beesee-gold)' }} />
              <span className="bee-body-sm">Live demo scheduled at your convenience</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/">
            <button 
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              style={{
                border: '2px solid rgba(253, 204, 0, 0.3)',
                color: 'var(--text-light)',
                background: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(253, 204, 0, 0.1)';
                e.currentTarget.style.borderColor = 'var(--beesee-gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(253, 204, 0, 0.3)';
              }}
            >
              <Home size={20} /> Return to Homepage
            </button>
          </Link>

          <Link to="/products">
            <button className="beesee-button beesee-button--small">
              <Package size={20} /> Explore Products
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  ) : (
    <section 
      id="contact-section"
      className="py-24 bg-[#000000] text-white fade-up-init"
      style={{ minHeight: '100vh' }}
    >
 {/* HEADER — MOVED UPWARD ONLY */}
      <div className="text-center mb-12 px-6 -mt-16">
        <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow">
          PLACEHOLDER TEXT
        </h3>
        <p className="bee-body max-w-3xl mx-auto mt-4 text-[#C7B897]">
          lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <motion.div
          ref={leftColumnRef}
          initial={{ opacity: isMobile ? 1 : 0, x: 0 }}
          animate={inViewLeft ? { opacity: 1, x: 0 } : { opacity: isMobile ? 1 : 0, x: isMobile ? 0 : -100 }}
          transition={{ duration: isMobile ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h2 className="bee-title-md" style={{ lineHeight: '1.1', color: 'var(--beesee-gold)' }}>
              Ready to Transform Your Organization?
            </h2>
            <p className="bee-body" style={{ lineHeight: '1.7' }}>
              Let our experts help you choose the perfect solution for your unique needs. Schedule a consultation or request a custom quote today.
            </p>
          </div>

          {/* Contact Info Cards - BeeSee Card Style with Horizontal Layout */}
          <div className="space-y-6">
            <div className="beesee-card-content" style={{ padding: '1.25rem' }}>
              <div className="flex items-center space-x-4">
                <div className="icon-wrap" style={{ width: '60px', height: '60px', margin: '0' }}>
                  <Phone size={24} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div className="bee-body-sm" style={{ fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.25rem', fontSize: '16px' }}>
                    SALES
                  </div>
                  <div className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                    +63 912 345 6789
                  </div>
                </div>
              </div>
            </div>

            <div className="beesee-card-content" style={{ padding: '1.25rem' }}>
              <div className="flex items-center space-x-4">
                <div className="icon-wrap" style={{ width: '60px', height: '60px', margin: '0' }}>
                  <Mail size={24} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div className="bee-body-sm" style={{ fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.25rem', fontSize: '16px' }}>
                    SUPPORT
                  </div>
                  <div className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                    info@beese.ph
                  </div>
                </div>
              </div>
            </div>

            <div className="beesee-card-content" style={{ padding: '1.25rem' }}>
              <div className="flex items-center space-x-4">
                <div className="icon-wrap" style={{ width: '60px', height: '60px', margin: '0' }}>
                  <MessageSquare size={24} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div className="bee-body-sm" style={{ fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.25rem', fontSize: '16px' }}>
                    LIVE CHAT SUPPORT
                  </div>
                  <div className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                    Available 24/7 for clients
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Form */}
        <motion.div
          ref={rightColumnRef}
          initial={{ opacity: isMobile ? 1 : 0, x: 0 }}
          animate={inViewRight ? { opacity: 1, x: 0 } : { opacity: isMobile ? 1 : 0, x: isMobile ? 0 : 100 }}
          transition={{ duration: isMobile ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="beesee-card-content"
        >
          <h3 
            className="bee-title-sm" 
            style={{ 
              marginBottom: '1.5rem', 
              color: '#FDCC00',
              fontSize: '32px'
            }}
          >
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
              className="beesee-button"
              style={{ width: '100%' }}
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

          <p className="bee-body-sm" style={{ marginTop: '1rem', textAlign: 'center', color: '#6b7280' }}>
            By submitting this form, you agree to our{' '}
            <Link to="/privacy" style={{ color: 'var(--beesee-gold)', textDecoration: 'none' }}>
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/terms" style={{ color: 'var(--beesee-gold)', textDecoration: 'none' }}>
              Terms of Service
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;