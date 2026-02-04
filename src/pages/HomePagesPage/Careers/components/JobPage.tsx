import React, { useState, useEffect } from 'react';
import beeseelogo from '../../../../../public/beeseelogo.png';
import QrWithLogo from '../../../../components/ui/QRWithLogo';
import '../../../../../src/assets/css/Career.css';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Calendar,
  AlertCircle,
  Loader2,
  Send
} from 'lucide-react';
import Apply from './Apply';
import DOMPurify from 'dompurify';
import { getSpecificJobPublic } from '../../../../services/Technician/careersServices';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

interface JobPosting {
  job_reference_number: string;
  title: string; 
  location: string;
  job_type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  created_at: string;
  description: string;
  careers_job_details: string; 
  workLocation?: string;
} 

const JobPage: React.FC = () => {
  const { id } = useParams();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Sanitize HTML function
  const sanitizeHTML = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'i', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'b'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
      ALLOW_DATA_ATTR: false,
    });
  };

  const { data: jobResponse, isLoading } = useQuery<JobPosting>({
    queryKey: ['job', id],
    queryFn: () => getSpecificJobPublic(String(id)),
    enabled: !!id
  })

  const job: JobPosting | null = jobResponse?.data ?? null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-up-init').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [job]);

  // Loading State
  return isLoading ? (
    <div className="min-h-screen bg-[#000] flex items-center justify-center">
      <div className="text-center">
        <Loader2 
          className="w-12 h-12 animate-spin mx-auto mb-4" 
          style={{ color: 'var(--beesee-gold, #FDCC00)' }}
        />
        <p className="text-white/60 text-lg">Loading job details...</p>
      </div>
    </div>
  ) : !job ? (
    <div className="min-h-screen bg-[#000] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'rgba(253, 204, 0, 0.1)',
            border: '2px solid rgba(253, 204, 0, 0.3)'
          }}
        >
          <AlertCircle 
            className="w-10 h-10" 
            style={{ color: 'var(--beesee-gold, #FDCC00)' }}
          />
        </div>
        
        <h2 
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ 
            fontFamily: '"Bebas Neue", sans-serif',
            color: 'var(--beesee-light, #fff)',
            letterSpacing: '0.02em'
          }}
        >
          Job Not Found
        </h2>
        
        <p className="text-white/60 text-base md:text-lg mb-8 leading-relaxed">
          Sorry, we couldn't find the job posting you're looking for. 
          It may have been filled or removed.
        </p>
        
        <button
          onClick={() => window.location.href = '/careers'}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
          style={{
            background: 'var(--beesee-gold, #FDCC00)',
            color: '#000',
          }}
        >
          <ChevronRight size={18} className="rotate-180" />
          Back to Careers
        </button>
      </div>
    </div>
  ) : (
    <div className="job-page min-h-screen bg-[#000] text-white overflow-x-hidden">
      
      {/* HERO SECTION - Mobile optimized with proper top spacing */}
      <div 
        className="relative min-h-[100vh] h-auto md:h-[80vh] md:overflow-hidden flex items-center justify-center pb-10 md:pb-0"
        style={{
          background: isMobile 
            ? 'linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)), url("/careerMobile.jpg")'
            : 'linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)), url("/careerSamp.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll',
          // Add proper top spacing for mobile
          paddingTop: isMobile ? '80px' : '12px',
          marginTop: '0px'
        }}
      >
        {/* Desktop gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000]/5 to-[#000]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000]/5 via-transparent to-[#000]/5" />

        {/* Mobile overlay for better text contrast */}
        {isMobile && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        )}

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 md:px-6 w-full">
          <div className="fade-up-init flex flex-col items-center">
        
            {/* JOB TITLE - Mobile optimized */}
            <h1
              className="mb-6 md:mb-10 max-w-3xl mx-auto px-2"
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: isMobile ? 'clamp(40px, 9vw, 90px)' : 'clamp(42px, 10vw, 110px)',
                lineHeight: isMobile ? '1.1' : '1',
                color: 'var(--beesee-light)',
                textShadow: isMobile ? '0 6px 25px rgba(0,0,0,0.8)' : '0 4px 30px rgba(0,0,0,0.6)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}
            >
              {job.title}
            </h1>

            {/* JOB META - Grid layout for mobile */}
            <div className={`${isMobile ? 'grid grid-cols-1 gap-3' : 'flex flex-wrap justify-center items-center gap-6'} mb-6 md:mb-10 w-full ${isMobile ? 'max-w-md' : ''} mx-auto`}>
              {[{
                icon: <MapPin size={isMobile ? 20 : 20} />,
                text: job.location,
                label: "Location"
              },{
                icon: <Briefcase size={isMobile ? 20 : 20} />,
                text: `Work Location: ${job.workLocation || 'Onsite'}`,
                label: "Type"
              },{
                icon: <Clock size={isMobile ? 20 : 20} />,
                text: job.job_type,
                label: "Schedule"
              },{
                icon: <Calendar size={isMobile ? 20 : 20} />,
                text: `Posted ${new Date(job.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}`,
                label: "Posted"
              }].map((item, i) => (
                <div 
                  key={i} 
                  className={`${isMobile ? 
                    'beesee-card-content flex items-center gap-3 text-left w-full' : 
                    'flex flex-col sm:flex-row items-center justify-center gap-2.5 w-[calc(50%-12px)] sm:w-auto'}`}
                  style={{
                    background: !isMobile ? 'transparent' : '',
                    border: !isMobile ? 'none' : '',
                    backdropFilter: !isMobile ? 'none' : '',
                    boxShadow: !isMobile ? 'none' : '',
                    padding: isMobile ? '12px' : undefined,
                    textAlign: isMobile ? 'left' : undefined
                  }}
                >
                  <div
                    className={`${isMobile ? 'w-11 h-11' : 'w-10 h-10 md:w-11 md:h-11'} rounded-full flex items-center justify-center flex-shrink-0`}
                    style={{
                      background: isMobile ? 'linear-gradient(to bottom right, rgba(253, 204, 0, 0.20), rgba(255, 215, 0, 0.10))' : 'rgba(255, 255, 255, 0.18)',
                      border: isMobile ? '2px solid rgba(253, 204, 0, 0.30)' : '1px solid rgba(253, 204, 0, 0.35)',
                      color: isMobile ? 'var(--beesee-gold)' : 'inherit'
                    }}
                  >
                    {item.icon}
                  </div>
                  <div className={`${isMobile ? 'flex flex-col' : ''}`}>
                    {isMobile && (
                      <span className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-0.5">
                        {item.label}
                      </span>
                    )}
                    <span className={`${isMobile ? 'bee-body1 font-medium text-white text-sm text-left' : 'bee-body1 font-medium text-center'}`}>
                      {item.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* APPLY CTA - Mobile optimized */}
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} items-center justify-center gap-3 md:gap-4 mt-2 w-full ${isMobile ? 'max-w-md' : 'max-w-md md:max-w-none'} mx-auto`}>
              <button
                onClick={() => setShowApplicationForm(true)}
                className={`beesee-button1 beesee-button1--small ${isMobile ? 'w-full py-3.5' : 'w-full md:w-auto'} flex items-center justify-center gap-2`}
              >
                <Send size={isMobile ? 18 : 18} />
                <span className={isMobile ? 'tracking-wide text-base' : 'tracking-wide'}>APPLY NOW</span>
              </button>

              <div
                className={`${isMobile ? 'w-full px-4 py-3' : 'w-full md:w-auto px-5 py-2.5'} rounded-lg`}
                style={{
                  border: '1px solid rgba(253, 204, 0, 0.35)',
                  background: isMobile ? 'rgba(253, 204, 0, 0.12)' : 'rgba(253, 204, 0, 0.1)'
                }}
              >
                <span
                  className="bee-body-sm font-semibold"
                  style={{ color: 'var(--beesee-gold)', fontSize: isMobile ? '14px' : '15px' }}
                >
                  Job ID: {job.job_reference_number}
                </span>
              </div>
            </div>

            {/* QR Code - VISIBLE ON ALL SCREENS */}
            <div className='flex items-center justify-center gap-4 mt-8 md:mt-12 mb-8 md:mb-0 animate-in fade-in zoom-in duration-700 delay-300'>
              <div className={`p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 ${isMobile ? 'w-full max-w-md mx-auto' : ''}`}>
                <QrWithLogo 
                  value={`${import.meta.env.VITE_API_URL_FRONTEND}/bsg/career/${job.job_reference_number}`} 
                  logoUrl={beeseelogo} 
                  size={isMobile ? 180 : 180}
                />
                <p className="text-center text-white/40 text-xs mt-3 uppercase tracking-widest"></p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MAIN CONTENT - Mobile optimized readability */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">

        {/* ABOUT */}
        <section className="mb-12 md:mb-20 fade-up-init text-left">
          <div className="flex items-center gap-4 mb-4 md:mb-6"> 
            <p className="bee-title-md" style={{ color: 'var(--beesee-gold)' }}>
              About the Role
            </p>
          </div>

          {/* Mobile: Better contrast container */}
          <div 
            className="beesee-card-content1"
            style={{
              background: isMobile ? 'rgba(20, 20, 20, 0.7)' : '',
              borderRadius: isMobile ? '12px' : '',
              padding: isMobile ? '20px' : '',
              border: isMobile ? '1px solid rgba(255, 255, 255, 0.1)' : ''
            }}
          >
            <p 
              className="bee-body leading-relaxed"
              style={{ 
                fontSize: isMobile ? '15px' : '15px',
                color: isMobile ? '#f0f0f0' : '#C7B897',
                opacity: isMobile ? 0.9 : 0.7,
                textAlign: 'left', 
                textAlignLast: 'left',
                WebkitFontSmoothing: isMobile ? 'antialiased' : 'auto',
                MozOsxFontSmoothing: isMobile ? 'grayscale' : 'auto'
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(job.description) }}
            />
          </div>
        </section>

        {/* RESPONSIBILITIES & QUALIFICATIONS */}
        <section className="mb-12 md:mb-20 fade-up-init text-left"> 
          {/* Mobile: Better contrast container */}
          <div 
            className="beesee-card-content1"
            style={{
              background: isMobile ? 'rgba(20, 20, 20, 0.7)' : '',
              borderRadius: isMobile ? '12px' : '',
              padding: isMobile ? '20px' : '',
              border: isMobile ? '1px solid rgba(255, 255, 255, 0.1)' : ''
            }}
          >
            <p 
              className="bee-body leading-relaxed"
              style={{ 
                fontSize: isMobile ? '15px' : '15px',
                color: isMobile ? '#f0f0f0' : '#C7B897',
                opacity: isMobile ? 0.9 : 0.7,
                textAlign: 'left', 
                textAlignLast: 'left',
                WebkitFontSmoothing: isMobile ? 'antialiased' : 'auto',
                MozOsxFontSmoothing: isMobile ? 'grayscale' : 'auto'
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(job.careers_job_details) }}
            />
          </div>
        </section> 

        {/* FINAL CTA - Mobile optimized */}
        <section 
          className="fade-up-init text-center py-8 md:py-10 rounded-xl md:rounded-none"
          style={{
            background: isMobile 
              ? 'linear-gradient(180deg, rgba(30,30,30,0.9) 0%, rgba(20,20,20,0.8) 100%)' 
              : 'transparent',
            border: isMobile ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
          }}
        >
          <h2 className="bee-title-md mb-4 md:mb-5" style={{ color: 'var(--beesee-gold)' }}>
            Ready to Join Our Team?
          </h2>
          <p className="bee-body mb-6 md:mb-10 max-w-2xl mx-auto text-[15px] md:text-[17px] px-4">
            Take the next step in your career journey and become part of our innovative, 
            collaborative team at BEESEE.
          </p>
          <button
            onClick={() => setShowApplicationForm(true)}
            className="beesee-button beesee-button--small flex items-center gap-2 mx-auto px-6 md:px-8 py-3 md:py-4"
          >
            <Send size={isMobile ? 16 : 18} />
            Submit Your Application
          </button>
        </section>
      </div>

      {/* MODAL */}
      <Apply
        isOpen={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
        jobTitle={job.title}
        jobId={job.job_reference_number}
      />
    </div>
  );
};

export default JobPage;