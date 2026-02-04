import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { userAuth } from '../../../hooks/userAuth';
import Snackbar from '../../../components/feedback/Snackbar';
import { CheckCircle, Clock, FileText, Calendar, Home, Phone, Mail, Send, User2, Building2, Map, MapPin, ExternalLink } from 'lucide-react';
import CustomTextField from '../../../components/Fields/CustomTextField';
import CustomSelectField from '../../../components/Fields/CustomSelectField';
import TextsmsIcon from '@mui/icons-material/Textsms';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { createConsultation, fetchCategory } from '../../../services/Technician/inquiriesServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Subject } from '@mui/icons-material';

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
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const { id } = useParams();
    const { setSnackBarOpen, setSnackBarMessage, setSnackBarType, snackBarOpen, snackBarMessage, snackBarType } = userAuth();
    const [formError, setFormError] = useState<FormError>({});
    const [formData, setFormData] = useState<formData>({
        name: '',
        email: '',
        company: '',
        position: '',
        contact_number: '',
        subject: '',
        description: '',
    });

    const [submitted, setSubmitted] = useState<boolean>(false);
    console.log(id);

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
                label: item.name,
            }));

            mapped.push({
                value: 'general_inquiry',
                label: 'General Inquiry',
            });
            return mapped;
        },
    });

    /* inserting data */
    const { mutateAsync: createInquiriesMutate, isPending: isCreating } = useMutation({
        mutationFn: createConsultation,
    });

    // Animation refs
    const leftColumnRef = useRef<HTMLDivElement | null>(null);
    const rightColumnRef = useRef<HTMLDivElement | null>(null);
    const inViewLeft = useInView(leftColumnRef, { once: false, amount: 0.25 });
    const inViewRight = useInView(rightColumnRef, { once: false, amount: 0.25 });

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Set page title
    useEffect(() => {
        document.title = 'Inquiries - Beesee Global Technology Inc.';
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

            await createInquiriesMutate(formData);

            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setSnackBarMessage('Failed to submit, Please try again.');
            setSnackBarType('error');
            setSnackBarOpen(true);
        }
    };
    const location = {
        address: '#65-D Scout Borromeo, South Triangle, Quezon City',
        lat: 14.6333,
        lng: 121.0333,
        url: 'https://www.google.com/maps/search/?api=1&query=65-D+Scout+Borromeo+Street+South+Triangle+Quezon+City',
    };

    const embedUrl = 'https://maps.google.com/maps?q=Beesee%20Global%20Technology%20Inc,%20Scout%20Borromeo,%20Quezon%20City&z=17&output=embed';

    const handleReset = () => {
        setSubmitted(false);
        setFormData({
            name: '',
            email: '',
            company: '',
            position: '',
            contact_number: '',
            subject: '',
            description: '',
        });
    };

    useEffect(() => {
        if (id === 'kiosk') {
            setFormData((prev) => ({
                ...prev,
                subject: 'Inquiry Regarding Kiosk Services',
            }));
        }
    }, [id]);

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url('/live-background/randomBg2Gray.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Add the same gradient overlays as FAQ page */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        background: `
              linear-gradient(
                to bottom,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,0.85) 5%,
                rgba(0,0,0,0.55) 25%,
                rgba(0,0,0,0.25) 40%,
                rgba(0,0,0,0.08) 60%,
                rgba(0,0,0,0) 100%
              ),
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
            <section className="relative z-10 pt-20 sm:pt-28 md:pt-36 pb-20 px-4 sm:px-6 md:px-8">
                <Snackbar open={snackBarOpen} type={snackBarType} message={snackBarMessage} onClose={() => setSnackBarOpen(false)} />

                {submitted ? (
                    <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                        {isMobile ? (
                            <>
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
                                    style={{
                                        background: 'rgba(253, 204, 0, 0.15)',
                                        border: '2px solid var(--beesee-gold)',
                                    }}
                                >
                                    <CheckCircle size={40} style={{ color: 'var(--beesee-gold)' }} />
                                </div>

                                <h2 className="bee-title-lg mb-6" style={{ color: 'var(--beesee-gold)' }}>
                                    Thank You for Your Interest!
                                </h2>

                                <p className="bee-body-lg mb-8 max-w-2xl mx-auto">
                                    Your inquiry has been received. Our solutions team will contact you within 24 hours to discuss your requirements and schedule a personalized demonstration.
                                </p>

                                <div
                                    className="rounded-2xl p-6 mb-8 max-w-2xl mx-auto"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(253, 204, 0, 0.22)',
                                    }}
                                >
                                    <h3 className="bee-title-sm mb-6" style={{ color: 'var(--text-light)' }}>
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
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                                        style={{
                                            border: '2px solid rgba(253, 204, 0, 0.3)',
                                            color: 'var(--text-light)',
                                            background: 'transparent',
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
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                                        style={{
                                            background: 'var(--beesee-gold)',
                                            color: '#000',
                                            border: '2px solid var(--beesee-gold)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#e6b800';
                                            e.currentTarget.style.borderColor = '#e6b800';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--beesee-gold)';
                                            e.currentTarget.style.borderColor = 'var(--beesee-gold)';
                                        }}
                                    >
                                        <Send size={20} /> Submit Another Inquiry
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
                                    <div
                                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
                                        style={{
                                            background: 'rgba(253, 204, 0, 0.15)',
                                            border: '2px solid var(--beesee-gold)',
                                        }}
                                    >
                                        <CheckCircle size={40} style={{ color: 'var(--beesee-gold)' }} />
                                    </div>
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.2 }}
                                    className="bee-title-lg mb-6"
                                    style={{ color: 'var(--beesee-gold)' }}
                                >
                                    Thank You for Your Interest!
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.3 }}
                                    className="bee-body-lg mb-8 max-w-2xl mx-auto"
                                >
                                    Your inquiry has been received. Our solutions team will contact you within 24 hours to discuss your requirements and schedule a personalized demonstration.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.4 }}
                                    className="rounded-2xl p-6 mb-8 max-w-2xl mx-auto"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(253, 204, 0, 0.22)',
                                    }}
                                >
                                    <h3 className="bee-title-sm mb-6" style={{ color: 'var(--text-light)' }}>
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
                                    <button
                                        onClick={() => navigate('/')}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                                        style={{
                                            border: '2px solid rgba(253, 204, 0, 0.3)',
                                            color: 'var(--text-light)',
                                            background: 'transparent',
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
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                                        style={{
                                            background: 'var(--beesee-gold)',
                                            color: '#000',
                                            border: '2px solid var(--beesee-gold)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#e6b800';
                                            e.currentTarget.style.borderColor = '#e6b800';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--beesee-gold)';
                                            e.currentTarget.style.borderColor = 'var(--beesee-gold)';
                                        }}
                                    >
                                        <Send size={20} /> Submit Another Inquiry
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Title Section */}
                        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
                            {isMobile ? (
                                <>
                                    <h1 className="bee-title-lg text-[#FDCC00] mb-4 sm:mb-5 px-2 sm:px-4 whitespace-nowrap overflow-hidden drop-shadow-md">
                                        BUSINESS INQUIRIES
                                    </h1>
                                    <p className="bee-body-lg opacity-90 max-w-2xl mx-auto">
                                        Get in touch with our solutions team for product demonstrations, system maintenance, and enterprise solutions.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <motion.h1
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.7 }}
                                        className="bee-title-lg text-[#FDCC00] mb-4 sm:mb-5 px-2 sm:px-4 whitespace-nowrap overflow-hidden drop-shadow-md"
                                    >
                                        BUSINESS INQUIRIES
                                    </motion.h1>

                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.7, delay: 0.1 }}
                                        className="bee-body-lg opacity-90 max-w-2xl mx-auto"
                                    >
                                        Get in touch with our solutions team for product demonstrations, system maintenance, and enterprise solutions.
                                    </motion.p>
                                </>
                            )}
                        </div>

                        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Column */}
                            {isMobile ? (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h2 className="bee-title-md" style={{ lineHeight: '1.1', color: 'var(--beesee-gold)' }}>
                                            Ready to Transform Your Organization?
                                        </h2>
                                        <p className="bee-body-lg" style={{ lineHeight: '1.7' }}>
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
                                                        +63 927 609 3575
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
                                                        support@beese.ph
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="beesee-card-content" style={{ padding: '1.25rem' }}>
                                            <div className="flex items-center space-x-4">
                                                <div className="icon-wrap" style={{ width: '60px', height: '60px', margin: '0' }}>
                                                    <Map size={24} />
                                                </div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <div className="bee-body-sm" style={{ fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.25rem', fontSize: '16px' }}>
                                                        ADDRESS
                                                    </div>
                                                    <div className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                                                        #65-D Scout Borromeo, South Triangle, Quezon City
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
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-4">
                                        <h2 className="bee-title-md" style={{ lineHeight: '1.1', color: 'var(--beesee-gold)' }}>
                                            Ready to Transform Your Organization?
                                        </h2>
                                        <p className="bee-body-lg" style={{ lineHeight: '1.7' }}>
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
                                                        +63 927 609 3575
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
                                                    <Map size={24} />
                                                </div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <div className="bee-body-sm" style={{ fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.25rem', fontSize: '16px' }}>
                                                        ADDRESS
                                                    </div>
                                                    <div className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                                                        #65-D Scout Borromeo, South Triangle, Quezon City
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
                                        className="bee-title-sm mb-6"
                                        style={{
                                            color: '#FDCC00',
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
                                                type="text"
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
                                                type="text"
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
                                                type="text"
                                                multiline={false}
                                                rows={1}
                                                maxLength={100}
                                            />

                                            <CustomTextField
                                                name="position"
                                                placeholder="Enter your position"
                                                value={formData?.position}
                                                onChange={handleInputChange}
                                                type="text"
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
                                            placeholder="Enter a subject"
                                            onChange={handleInputChange}
                                            multiline={false}
                                            inputProps={{ readOnly: id === 'kiosk' }}
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
                                            type="text"
                                            icon={<TextsmsIcon />}
                                            error={!!formError?.description}
                                            helperText={formError?.description}
                                        />

                                        <button type="submit" disabled={isCreating} className="beesee-button" style={{ width: '100%' }}>
                                            {isCreating ? (
                                                <span className="animate-pulse">Submitting...</span>
                                            ) : (
                                                <>
                                                    <Send size={20} /> Submit Inquiry
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <p className="bee-body-sm mt-4 text-center" style={{ color: '#fff' }}>
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
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                    className="beesee-card-content"
                                >
                                    <h3
                                        className="bee-title-sm mb-6"
                                        style={{
                                            color: '#FDCC00',
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
                                                type="text"
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
                                                type="text"
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
                                                type="text"
                                                multiline={false}
                                                rows={1}
                                                maxLength={100}
                                            />

                                            <CustomTextField
                                                name="position"
                                                placeholder="Enter your position"
                                                value={formData?.position}
                                                onChange={handleInputChange}
                                                type="text"
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
                                            placeholder="Enter a subject"
                                            onChange={handleInputChange}
                                            multiline={false}
                                            maxLength={150}
                                            disabled={id === 'kiosk'}
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
                                            type="text"
                                            icon={<TextsmsIcon />}
                                            error={!!formError?.description}
                                            helperText={formError?.description}
                                        />

                                        <button type="submit" disabled={isCreating} className="beesee-button" style={{ width: '100%' }}>
                                            {isCreating ? (
                                                <span className="animate-pulse">Submitting...</span>
                                            ) : (
                                                <>
                                                    <Send size={20} /> Submit Inquiry
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <p className="bee-body-sm mt-4 text-center" style={{ color: '#fff' }}>
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
            </section>

            {/* ✅ MAP */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
                <div className="beesee-card-content overflow-hidden">
                    <div className="p-6 flex justify-between items-center">
                        <div className="flex items-center gap-3" style={{ color: 'var(--beesee-gold)' }}>
                            <MapPin size={40} />
                            <div>
                                <h3 className="bee-title-sm text-left" style={{ color: 'var(--beesee-gold)' }}>
                                    Our Location
                                </h3>

                                <p className="bee-body-sm">{location.address}</p>
                            </div>
                        </div>
                        <a href={location.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink />
                        </a>
                    </div>
                    <iframe src={embedUrl} className="w-full h-[450px]" loading="lazy" style={{ border: 0 }} />
                </div>
            </section>
        </div>
    );
};

export default Inquiries;