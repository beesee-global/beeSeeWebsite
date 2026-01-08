import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { userAuth } from '../../../../hooks/userAuth';
import Snackbar from '../../../../components/feedback/Snackbar';
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
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { 
  createConsultation, 
  fetchCategory 
} from '../../../../services/Technician/inquiriesServices'
import { 
  useMutation, 
  useQuery 
} from '@tanstack/react-query'  

interface formData {
  name: string;
  email: string;
  company: string;
  position: string;
  contact_number: string;
  subject: string;
  description: string;
}

interface FormError {
  name?: string;
  email?: string;
  company?: string;
  position?: string;
  contact_number?: string;
  subject?: string;
  description?: string;
}

const Inquiries = () => {
  const [isMobile, setIsMobile] = useState(false);
  const {
    setSnackBarOpen,
    setSnackBarMessage, 
    setSnackBarType, 
    snackBarOpen,
    snackBarMessage,
    snackBarType
  } = userAuth();
  const [formError, setFormError] = useState<FormError>({});
  const [formData, setFormData] = useState<formData>({
    name: '',
    email: '',
    company: '',
    position: '',
    contact_number: "",
    subject: '',
    description: '',
  });
 
  const [submitted, setSubmitted] = useState<boolean>(false);

  const roleOptions = [
    { value: 'cto', label: 'Chief Technology Officer' },
    { value: 'cio', label: 'Chief Information Officer' },
    { value: 'it-director', label: 'IT Director' },
    { value: 'procurement', label: 'Procurement Manager' },
    { value: 'operations', label: 'Operations Manager' },
    { value: 'other', label: 'Other' },
  ];
 
  const { data: subjectOptions = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategory,
    select: (res) => {
      const mapped = res.data.map((item: any) => ({
        value: item.name,
        label: item.name
      }));

      mapped.push ({ 
        value: 'general_inquiry', 
        label: "General Inquiry" 
      });
      return mapped;
    }
  });

  /* inserting data */
  const {
    mutateAsync: createInquiriesMutate,
    isPending: isCreating,
  } = useMutation({
    mutationFn: createConsultation,
  });

  // Animation refs
  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const rightColumnRef = useRef<HTMLDivElement | null>(null);
  const inViewLeft = useInView(leftColumnRef, { amount: 0.25 });
  const inViewRight = useInView(rightColumnRef, { amount: 0.25 });

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
    if (!formData?.name.trim()) errors.name = 'Full name is required.';
    if (!formData?.email.trim()) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData?.email)) errors.email = 'Invalid email format.';
    if (!formData?.company.trim()) errors.company = 'Company is required.';
    if (!formData?.position.trim()) errors.position = 'Role is required.';
    if (!formData?.contact_number.trim()) errors.contact_number = 'Phone number is required.';
    else if (!/^09\d{9}$/.test(formData?.contact_number)) errors.contact_number = 'Phone number must start with 09 and be 11 digits long.';
    if (!formData?.subject) errors.subject = 'Subject is required.';
    if (!formData?.description.trim()) errors.description = 'Message is required.';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      const errors = validateForm();
      setFormError(errors);
      if (Object.keys(errors).length > 0) return;

      await createInquiriesMutate(formData)

      setSubmitted(true)
       
    } catch (err) {
      console.error(err);
      setSnackBarMessage("Failed to submit, Please try again.")
      setSnackBarType('error')
      setSnackBarOpen(true) 
    }
  };

  return (
    <section
      id="contact-section"
      className="relative w-full py-24 text-white overflow-hidden"
    >
      {/* SCOPED BACKGROUND*/}
      <div
        className="absolute inset-0 z-0"
        style={{
          /* backgroundImage: "url('/live-background/try5.png')", */
          backgroundImage: "url('/live-background/download.jpg')", 
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
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.9) 5%,
    rgba(0, 0, 0, 0.6) 25%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.0) 100%
  ),
  /* Bottom gold/yellow fade */
  linear-gradient(
    to top,
    rgba(253, 204, 0, 0.35) 0%,
    rgba(253, 204, 0, 0.25) 15%,
    rgba(253, 204, 0, 0.15) 35%,
    rgba(253, 204, 0, 0.08) 55%,
    rgba(253, 204, 0, 0.03) 75%,
    rgba(253, 204, 0, 0.00) 100%
  )
`,


          }}        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10">
        {submitted ? (
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            {/* Snackbar */}
            <Snackbar 
              open={snackBarOpen} 
              type={snackBarType} 
              message={snackBarMessage} 
              onClose={() => setSnackBarOpen(false)} 
            />

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
            </motion.div>
          </div>
        ) : (
          <>
            {/* Snackbar */}
            <Snackbar 
              open={snackBarOpen} 
              type={snackBarType} 
              message={snackBarMessage} 
              onClose={() => setSnackBarOpen(false)} 
            />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column */}
              {isMobile ? (
                <div className="space-y-8">
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
                </div>
              ) : (
                <motion.div
                  ref={leftColumnRef}
                  initial={{ opacity: 0, x: -100 }}
                  animate={inViewLeft ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
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
              )}

              {/* Right Column - Form */}
              {isMobile ? (
                <div className="beesee-card-content">
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
                        value={formData?.name}
                        onChange={handleInputChange}
                        icon={<User2 />}
                        rows={1}
                        maxLength={100}
                        type='text'
                        multiline={false}
                        error={!!formError?.name}
                        helperText={formError?.name}
                      />
                      <CustomTextField
                        name="email"
                        placeholder="Enter your email"
                        value={formData?.email}
                        onChange={handleInputChange}
                        rows={1}
                        maxLength={100}
                        type='text'
                        multiline={false}
                        icon={<Mail />}
                        error={!!formError?.email}
                        helperText={formError?.email}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <CustomTextField
                        name="company"
                        placeholder="Enter company name"
                        value={formData?.company}
                        onChange={handleInputChange}
                        icon={<Building2 />}
                        error={!!formError?.company}
                        helperText={formError?.company}
                        type='text'
                        multiline={false}
                        rows={1}
                        maxLength={100}
                      />

                      <CustomTextField 
                        name='position'
                        placeholder='Enter your position'
                        value={formData?.position}
                        onChange={handleInputChange}
                        type='text'
                        icon={<ManageAccountsIcon />}
                        multiline={false}
                        rows={1}
                        maxLength={100}
                        helperText={formError?.position}
                        error={!!formError?.position}
                      />
                    </div>

                    <CustomTextField
                      name="contact_number"
                      placeholder="09XXXXXXXXX"
                      value={formData?.contact_number}
                      onChange={handleInputChange}
                      multiline={false}
                      maxLength={11}
                      type="tel"
                      rows={1}
                      icon={<Phone className="w-4 h-4" />}
                      error={!!formError?.contact_number}
                      helperText={formError?.contact_number}
                    />

                    <CustomTextField 
                      name="subject"
                      value={formData?.subject}
                      placeholder='Enter a subject'
                      onChange={handleInputChange}
                      multiline={false}
                      maxLength={150}
                      type="text"
                      rows={1}
                      error={!!formError?.subject}
                      helperText={formError?.subject}
                    />

                    <CustomTextField
                      name="description"
                      placeholder="Tell us about your requirements..."
                      value={formData?.description}
                      onChange={handleInputChange}
                      multiline={true}
                      maxLength={2550}
                      rows={4}
                      type='text'
                      icon={<TextsmsIcon />}
                      error={!!formError?.description}
                      helperText={formError?.description}
                    />

                    <button
                      type="submit"
                      disabled={isCreating}
                      className="beesee-button"
                      style={{ width: '100%' }}
                    >
                      {isCreating ? (
                        <span className="animate-pulse">Submitting...</span>
                      ) : (
                        <>
                          <Send size={20} /> Submit Inquiry
                        </>
                      )}
                    </button>
                  </form>

                  <p className="bee-body-sm" style={{ marginTop: '1rem', textAlign: 'center', color: '#fff' }}>
                    By submitting this form, you agree to our{' '}
                    <Link to="/privacy" style={{ color: 'var(--beesee-gold)', textDecoration: 'none' }}>
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link to="/terms" style={{ color: 'var(--beesee-gold)', textDecoration: 'none' }}>
                      Terms of Service
                    </Link>
                  </p>
                </div>
              ) : (
                <motion.div
                  ref={rightColumnRef}
                  initial={{ opacity: 0, x: 100 }}
                  animate={inViewRight ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
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
                        value={formData?.name}
                        onChange={handleInputChange}
                        icon={<User2 />}
                        rows={1}
                        maxLength={100}
                        type='text'
                        multiline={false}
                        error={!!formError?.name}
                        helperText={formError?.name}
                      />
                      <CustomTextField
                        name="email"
                        placeholder="Enter your email"
                        value={formData?.email}
                        onChange={handleInputChange}
                        rows={1}
                        maxLength={100}
                        type='text'
                        multiline={false}
                        icon={<Mail />}
                        error={!!formError?.email}
                        helperText={formError?.email}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <CustomTextField
                        name="company"
                        placeholder="Enter company name"
                        value={formData?.company}
                        onChange={handleInputChange}
                        icon={<Building2 />}
                        error={!!formError?.company}
                        helperText={formError?.company}
                        type='text'
                        multiline={false}
                        rows={1}
                        maxLength={100}
                      />

                      <CustomTextField 
                        name='position'
                        placeholder='Enter your position'
                        value={formData?.position}
                        onChange={handleInputChange}
                        type='text'
                        icon={<ManageAccountsIcon />}
                        multiline={false}
                        rows={1}
                        maxLength={100}
                        helperText={formError?.position}
                        error={!!formError?.position}
                      />
                    </div>

                    <CustomTextField
                      name="contact_number"
                      placeholder="09XXXXXXXXX"
                      value={formData?.contact_number}
                      onChange={handleInputChange}
                      multiline={false}
                      maxLength={11}
                      type="tel"
                      rows={1}
                      icon={<Phone className="w-4 h-4" />}
                      error={!!formError?.contact_number}
                      helperText={formError?.contact_number}
                    />

                    <CustomTextField 
                      name="subject"
                      value={formData?.subject}
                      placeholder='Enter a subject'
                      onChange={handleInputChange}
                      multiline={false}
                      maxLength={150}
                      type="text"
                      rows={1}
                      error={!!formError?.subject}
                      helperText={formError?.subject}
                    />

                    <CustomTextField
                      name="description"
                      placeholder="Tell us about your requirements..."
                      value={formData?.description}
                      onChange={handleInputChange}
                      multiline={true}
                      maxLength={2550}
                      rows={4}
                      type='text'
                      icon={<TextsmsIcon />}
                      error={!!formError?.description}
                      helperText={formError?.description}
                    />

                    <button
                      type="submit"
                      disabled={isCreating}
                      className="beesee-button"
                      style={{ width: '100%' }}
                    >
                      {isCreating ? (
                        <span className="animate-pulse">Submitting...</span>
                      ) : (
                        <>
                          <Send size={20} /> Submit Inquiry
                        </>
                      )}
                    </button>
                  </form>

                  <p className="bee-body-sm" style={{ marginTop: '1rem', textAlign: 'center', color: '#fff' }}>
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
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Inquiries;