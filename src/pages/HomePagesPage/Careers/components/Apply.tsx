import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Upload, 
  X, 
  FileText 
} from 'lucide-react';
import {
  careersEmail
} from '../../../../services/Technician/careersServices'
import Snackbar from '../../../../components/feedback/Snackbar';
import { userAuth } from '../../../../hooks/userAuth'

import {
  useMutation
} from '@tanstack/react-query'

interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  resume: File | null;
  port_polio_link: string;
  port_folio:  File | null;
}

interface ApplyProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobId: string;
}


const Apply: React.FC<ApplyProps> = ({ isOpen, onClose, jobTitle, jobId }) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    resume: null,
    port_polio_link: "",
    port_folio: null
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [isDraggingPortfolio, setIsDraggingPortfolio] = useState(false);

  const {
    setSnackBarMessage,
    setSnackBarOpen,
    setSnackBarType,
    snackBarOpen,
    snackBarMessage,
    snackBarType
  } = userAuth()

  // File upload handlers
  type FileField = 'resume' | 'port_folio';

  const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]);

  const allowedExtensions = new Set([
    'jpg',
    'jpeg',
    'png',
    'gif',
    'pdf', 
    'txt',
    'xls',
    'xlsx'
  ]);

  const isAllowedFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return (ext ? allowedExtensions.has(ext) : false) || allowedMimeTypes.has(file.type);
  };

  const handleFileChange = (field: FileField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!isAllowedFile(file)) {
        setSnackBarMessage('Please upload only valid file types (PDF, Word, Excel, or Images)');
        setSnackBarOpen(true);
        setSnackBarType('warning');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setSnackBarMessage('File size should not exceed 10MB');
        setSnackBarOpen(true);
        setSnackBarType('warning');
        return;
      }
 
      setFormData((prev) => (field === 'resume' ? { ...prev, resume: file } : { ...prev, port_folio: file }));
    }
  };

  const {
    mutateAsync: sentEmailCareers, isPending
  } = useMutation({
    mutationFn: careersEmail
  })

  const handleDragOver = (field: FileField) => (e: React.DragEvent) => {
    e.preventDefault();
    if (field === 'resume') setIsDraggingResume(true);
    else setIsDraggingPortfolio(true);
  };

  const handleDragLeave = (field: FileField) => (e: React.DragEvent) => {
    e.preventDefault();
    if (field === 'resume') setIsDraggingResume(false);
    else setIsDraggingPortfolio(false);
  };

  const handleDrop = (field: FileField) => (e: React.DragEvent) => {
    e.preventDefault();
    if (field === 'resume') setIsDraggingResume(false);
    else setIsDraggingPortfolio(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!isAllowedFile(file)) {
        setSnackBarMessage('Please upload only valid file types (PDF, Word, Excel, or Images)');
        setSnackBarOpen(true);
        setSnackBarType('warning');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setSnackBarMessage('File size should not exceed 10MB');
        setSnackBarOpen(true);
        setSnackBarType('warning');
        return;
      }
      
      setFormData((prev) => (field === 'resume' ? { ...prev, resume: file } : { ...prev, port_folio: file }));
    }
  };

  const removeResume = () => {
    setFormData({ ...formData, resume: null });
  };

  const removePortfolio = () => {
    setFormData({ ...formData, port_folio: null });
  };

  const handleSubmit = async() => {
    try {
      // Validation
      if (!formData.fullName || !formData.email || !formData.phone || !formData.resume) {
        setSnackBarMessage('Please fill in all required fields and upload your resume');
        setSnackBarOpen(true);
        setSnackBarType('warning');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setSnackBarMessage('Please enter a valid email address');
        setSnackBarOpen(true);
        setSnackBarType('warning');
        return;
      }

      // Phone validation (basic PH format)
      const phoneRegex = /^09\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        setSnackBarMessage('Phone number must start with 09 and be 11 digits long');
        setSnackBarOpen(true);
        setSnackBarType('warning');
        return;
      }

      // TODO: Send to API with FormData for file upload
      const submitData = new FormData(); 
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append("applying", jobTitle);
      submitData.append("job_number",jobId);
      if (formData.resume) {
        submitData.append('resume', formData.resume);
      } 

      if (formData.port_polio_link) {
        submitData.append('portfolio_link', formData.port_polio_link);
      }

      if (formData.port_folio) {
        submitData.append('portfolio', formData.port_folio)
      }

      const response = await sentEmailCareers(submitData);
      if(response?.success) { 
        setIsSubmitted(true);
      } 
    } catch (error: any) {
      if (error.response?.status === 409) {
        setSnackBarMessage(error.response.data.message || 'You have already applied for this position');
        setSnackBarOpen(true);
        setSnackBarType("info");
        return;
      }
      
      // Handle other errors
      setSnackBarMessage('Failed to submit application. Please try again.');
      setSnackBarOpen(true);
      setSnackBarType("error");
    }
  };

  const toTitleCase = (str: string) => 
    str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() +  txt.slice(1).toLowerCase());

  const toLowerCase = (str: string) => str.toLowerCase();

  const handleCloseSubmit = () => {
    setIsSubmitted(false);
      onClose();
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        resume: null,
        port_polio_link: "",
        port_folio: null 
    });
  }

  const handleClose = () => {
    if (!isSubmitted) {
      onClose();
      // Reset form after closing
      setTimeout(() => {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          resume: null,
          port_polio_link: "",
          port_folio: null
        });
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.3s ease-out'
      }} 
    >
      
      {/* Snackbar wrapper with higher z-index */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10001 }}>
        <Snackbar 
          open={snackBarOpen}
          message={snackBarMessage}
          type={snackBarType}
          onClose={() => setSnackBarOpen(false)}
        />
      </div>

      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 md:p-10"
        style={{
          position: 'relative',
          zIndex: 10000,
          background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.98), rgba(20, 20, 20, 0.98))',
          border: '1px solid rgba(253, 204, 0, 0.35)',
          boxShadow: '0 30px 90px rgba(253, 204, 0, 0.25)',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isSubmitted ? (
          <div className="text-center relative">
            <button
              onClick={handleCloseSubmit}
              className='absolute top-0 right-0 p-2 rounded-full hover:bg-white/50 transition'
            >
               <X size={38} style={{ color: 'var(--beesee-gold)' }} />
            </button>
            <div className='py-16'>
              <div
                className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(253, 204, 0, 0.3), rgba(255, 215, 0, 0.2))',
                  border: '2px solid rgba(253, 204, 0, 0.5)',
                  animation: 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                
                <CheckCircle2 size={48} style={{ color: 'var(--beesee-gold)' }} />
              </div>
              <h3 className="bee-title-md mb-5" style={{ color: 'var(--text-light)' }}>
                Application Submitted Successfully!
              </h3>
              <p className="bee-body max-w-md mx-auto">
                Thank you for applying to BEESEE. Our HR team will review your application
                and get back to you within 5-7 business days.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-10">
              <div>
                <h3 className="bee-title-sm mb-2" style={{ color: 'var(--text-light)' }}>
                  Apply for this Position
                </h3>
                <p className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                  {jobTitle}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:bg-white/10 hover:rotate-90"
                style={{ color: 'var(--muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block bee-body-sm mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-default"
                  placeholder="Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: toTitleCase(e.target.value) })}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block bee-body-sm mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="input-default"
                  placeholder="juan.delacruz@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: toLowerCase(e.target.value) })}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block bee-body-sm mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  inputMode='numeric'
                  pattern='[0-9]*'
                  className="input-default"
                  placeholder="09XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    phone: e.target.value.replace(/\D/g, '')
                  })}
                />
              </div>
  
              {/* Resume Upload */}
              <div>
                <label className="block bee-body-sm mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                  Upload Resume *
                </label>
                
                {formData.resume ? (
                  // Resume Uploaded State
                  <div
                    className="p-5 rounded-xl flex items-center justify-between"
                    style={{
                      background: 'rgba(253, 204, 0, 0.08)',
                      border: '1px solid rgba(253, 204, 0, 0.3)'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'rgba(253, 204, 0, 0.15)',
                          border: '1px solid rgba(253, 204, 0, 0.4)'
                        }}
                      >
                        <FileText size={24} style={{ color: 'var(--beesee-gold)' }} />
                      </div>
                      <div>
                        <p className="bee-body-sm font-medium" style={{ color: 'var(--text-light)' }}>
                          {formData.resume.name}
                        </p>
                        <p className="bee-body-sm" style={{ color: 'var(--muted)', fontSize: '13px' }}>
                          {(formData.resume.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeResume}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-red-500/20"
                      style={{ color: '#ff6b6b' }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  // Upload Drop Zone
                  <div
                    onDragOver={handleDragOver('resume')}
                    onDragLeave={handleDragLeave('resume')}
                    onDrop={handleDrop('resume')}
                    className="relative"
                  >
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf, 
                      .txt,
                      .xls,
                      .xlsx,
                      application/pdf,
                      application/msword,
                      application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                      text/plain,
                      application/vnd.ms-excel,
                      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                      .jpg,
                      .jpeg,
                      .png,
                      .gif,
                      image/jpeg,
                      image/png,
                      image/gif
                      "
                      onChange={handleFileChange('resume')}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="block p-8 rounded-xl text-center cursor-pointer transition-all duration-300"
                      style={{
                        background: isDraggingResume 
                          ? 'rgba(253, 204, 0, 0.12)' 
                          : 'rgba(255, 255, 255, 0.04)',
                        border: isDraggingResume
                          ? '2px dashed rgba(253, 204, 0, 0.5)'
                          : '2px dashed rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div
                        className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(253, 204, 0, 0.12)',
                          border: '1px solid rgba(253, 204, 0, 0.3)'
                        }}
                      >
                        <Upload size={26} style={{ color: 'var(--beesee-gold)' }} />
                      </div>
                      <p className="bee-body mb-2" style={{ color: 'var(--text-light)' }}>
                        {isDraggingResume ? 'Drop your file here' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                       Upload PDF or image (max 10 MB)
                      </p>
                    </label>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block bee-body-sm mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                  Portfolio url (Optional)
                </label>
                <input
                  type="text"
                  required
                  className="input-default"
                  placeholder="https://portfolio.vercel.app"
                  value={formData.port_polio_link}
                  onChange={(e) => setFormData({ ...formData, port_polio_link: e.target.value })}
                />
              </div>

              <div>
                <label className="block bee-body-sm mb-3 font-medium" style={{ color: 'var(--muted)' }}>
                  Upload Portfolio (Optional)
                </label>
                
                {formData.port_folio ? (
                  // Resume Uploaded State
                  <div
                    className="p-5 rounded-xl flex items-center justify-between"
                    style={{
                      background: 'rgba(253, 204, 0, 0.08)',
                      border: '1px solid rgba(253, 204, 0, 0.3)'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'rgba(253, 204, 0, 0.15)',
                          border: '1px solid rgba(253, 204, 0, 0.4)'
                        }}
                      >
                        <FileText size={24} style={{ color: 'var(--beesee-gold)' }} />
                      </div>
                      <div>
                        <p className="bee-body-sm font-medium" style={{ color: 'var(--text-light)' }}>
                          {formData.port_folio.name}
                        </p>
                        <p className="bee-body-sm" style={{ color: 'var(--muted)', fontSize: '13px' }}>
                          {(formData.port_folio.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removePortfolio}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-red-500/20"
                      style={{ color: '#ff6b6b' }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  // Upload Drop Zone
                  <div
                    onDragOver={handleDragOver('port_folio')}
                    onDragLeave={handleDragLeave('port_folio')}
                    onDrop={handleDrop('port_folio')}
                    className="relative"
                  >
                    <input
                      type="file"
                      id="portfolio-upload"
                      accept=".pdf, 
                      .txt,
                      .xls,
                      .xlsx,
                      application/pdf,
                      application/msword,
                      application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                      text/plain,
                      application/vnd.ms-excel,
                      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                      .jpg,
                      .jpeg,
                      .png,
                      .gif,
                      image/jpeg,
                      image/png,
                      image/gif
                      "
                      onChange={handleFileChange('port_folio')}
                      className="hidden"
                    />
                    <label
                      htmlFor="portfolio-upload"
                      className="block p-8 rounded-xl text-center cursor-pointer transition-all duration-300"
                      style={{
                        background: isDraggingPortfolio 
                          ? 'rgba(253, 204, 0, 0.12)' 
                          : 'rgba(255, 255, 255, 0.04)',
                        border: isDraggingPortfolio
                          ? '2px dashed rgba(253, 204, 0, 0.5)'
                          : '2px dashed rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div
                        className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(253, 204, 0, 0.12)',
                          border: '1px solid rgba(253, 204, 0, 0.3)'
                        }}
                      >
                        <Upload size={26} style={{ color: 'var(--beesee-gold)' }} />
                      </div>
                      <p className="bee-body mb-2" style={{ color: 'var(--text-light)' }}>
                        {isDraggingPortfolio ? 'Drop your file here' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="bee-body-sm" style={{ color: 'var(--muted)' }}>
                       Upload PDF or image (max 10 MB)
                      </p>
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button disabled={isPending} onClick={handleSubmit} className={`beesee-button ${isPending ? 'beesee-button--disabled cursor-not-allowed' : ''}`}>
                  <Send size={18} />
                  {isPending ? "Submitting..." :" Submit Application"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from { 
            transform: scale(0.8);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Custom scrollbar for modal */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(253, 204, 0, 0.3);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(253, 204, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Apply;
