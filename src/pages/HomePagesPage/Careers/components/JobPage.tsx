import React, { useState, useEffect } from 'react';
import beeseelogo from '../../../../../public/beeseelogo.png';
import QrWithLogo from '../../../../components/ui/QRWithLogo'
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
import { getSpecificJobPublic } from '../../../../services/Technician/careersServices'
import { useQuery } from '@tanstack/react-query'
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

  // FIXED: Change from [] to null
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
      
      {/* HERO SECTION */}
      <div 
        className="relative h-[85vh] md:h-[80vh] overflow-hidden flex items-center justify-center"
        style={{
          background: 'linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)), url("/careerBg3.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000]/5 to-[#000]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000]/5 via-transparent to-[#000]/5" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 md:px-6">
          <div className="fade-up-init">
        
            {/* JOB TITLE */}
            <h1
              className="mb-6 mt-10"
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: 'clamp(42px, 10vw, 110px)',
                lineHeight: '1',
                color: 'var(--beesee-light)',
                textShadow: '0 4px 30px rgba(0,0,0,0.6)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}
            >
              {job.title}
            </h1>

            {/* JOB META */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-10">
              {[{
                icon: <MapPin size={20} />,
                text: job.location
              },{
                icon: <Briefcase size={20} />,
                text: `Work Location: ${job.workLocation || 'Onsite'}`
              },{
                icon: <Clock size={20} />,
                text: job.job_type
              },{
                icon: <Calendar size={20} />,
                text: `Posted ${new Date(job.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}`
              }].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-[calc(50%-12px)] sm:w-auto">
                  <div
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.18)',
                      border: '1px solid rgba(253, 204, 0, 0.35)'
                    }}
                  >
                    {item.icon}
                  </div>
                  <span className="bee-body1 font-medium text-center">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* APPLY CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setShowApplicationForm(true)}
                className="beesee-button beesee-button--small flex items-center gap-2"
              >
                <Send size={18} />
                APPLY NOW
              </button>

              <div
                className="inline-block px-5 py-2.5 rounded-lg"
                style={{
                  border: '1px solid rgba(253, 204, 0, 0.35)',
                  background: 'rgba(253, 204, 0, 0.1)'
                }}
              >
                <span
                  className="bee-body-sm font-semibold"
                  style={{ color: 'var(--beesee-gold)', fontSize: '15px' }}
                >
                  Job ID: {job.job_reference_number}
                </span>
              </div>
            </div>

            <div className='flex items-center justify-center gap-4 mt-6'>
              <QrWithLogo 
                value={`${import.meta.env.VITE_API_URL_FRONTEND}/careers/${job.job_reference_number}`} 
                logoUrl={beeseelogo} 
                size={150}
              />
            </div>

          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-20">

        {/* ABOUT */}
        <section className="mb-16 md:mb-20 fade-up-init beesee-card-content1 text-left">
          <div className="flex items-center gap-4 mb-6 md:mb-2"> 
            <p className="bee-title-md" style={{ color: 'var(--beesee-gold)' }}>
              About the Role
            </p>
          </div>

          <p 
            className="bee-body text-sm sm:text-[15px] leading-relaxed text-[#C7B897]/70"
            style={{ textAlign: 'left', textAlignLast: 'left' }}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(job.description) }}
          /> 
        </section>

        {/* RESPONSIBILITIES & QUALIFICATIONS */}
        <section className="mb-16 md:mb-20 fade-up-init beesee-card-content1 text-left"> 
          <p 
            className="bee-body text-sm sm:text-[15px] leading-relaxed text-[#C7B897]/70"
            style={{ textAlign: 'left', textAlignLast: 'left' }}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(job.careers_job_details) }}
          />
        </section> 

        {/* FINAL CTA */}
        <section className="fade-up-init text-center">
          <h2 className="bee-title-md mb-5" style={{ color: 'var(--beesee-gold)' }}>
            Ready to Join Our Team?
          </h2>
          <p className="bee-body mb-10 max-w-2xl mx-auto text-[16px] md:text-[17px]">
            Take the next step in your career journey and become part of our innovative, 
            collaborative team at BEESEE.
          </p>
          <button
            onClick={() => setShowApplicationForm(true)}
            className="beesee-button beesee-button--small flex items-center gap-2 mx-auto"
          >
            <Send size={18} />
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