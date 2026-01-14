import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Calendar,
  Users,
  Award,
  Target,
  Send,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import Apply from './Apply';


interface JobPosting {
  job_reference_number: string;
  title: string; 
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  created_at: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  salary?: string;
  workLocation?: string;
}

interface JobPageProps {
  job: JobPosting;
}


const JobPage: React.FC<JobPageProps> = ({ job }) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Scroll animations on mount
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
  }, []);

  const goBack = () => {
    window.history.back();
  };
 
  return (
    <div className="job-page min-h-screen bg-[#000] text-white">
      {/* Hero Section with Background Image */}
      <div 
        className="relative h-[70vh] md:h-[80vh] overflow-hidden flex items-center justify-center"
        style={{
          background: 'linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)), url("/careerBg3.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Gradient Overlays*/} 
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000]/5 to-[#000]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#000]/5 via-transparent to-[#000]/5"></div>
        
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 md:px-6">
          <div className="fade-up-init">
            {/* Job ID Badge 
            <div className="inline-block mb-6 px-5 py-2.5 rounded-lg" style={{

            }}>
              <span className="bee-body-sm font-semibold" style={{ color: 'var(--beesee-gold)', fontSize: '15px' }}>
                Job ID: {job.job_reference_number}
              </span>
            </div> */}

            {/* Job Title */}
            <h1 className="mb-5 mt-8" style={{ 
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: '110px',
              lineHeight: '1',
              color: 'var(--beesee-light)',
              textShadow: '0 4px 30px rgba(0,0,0,0.6)',
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}>
              {job.title}
            </h1>

            {/* Job Info */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(253, 204, 0, 0.35)'
                }}>
                  <MapPin size={20} style={{ color: 'var(--beesee-light)' }} />
                </div>
                <span className="bee-body1 font-medium">{job.location}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(253, 204, 0, 0.35)'
                }}>
                  <Briefcase size={20} style={{ color: 'var(--beesee-light)' }} />
                </div>
                <span className="bee-body1 font-medium">Work Location: {job.workLocation || 'Onsite'}</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(253, 204, 0, 0.35)'
                }}>
                  <Clock size={20} style={{ color: 'var(--beesee-light)' }} />
                </div>
                <span className="bee-body1 font-medium">{job.type}</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{
                 background: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(253, 204, 0, 0.35)'
                }}>
                  <Calendar size={20} style={{ color: 'var(--beesee-light)' }} />
                </div>
                <span className="bee-body1 font-medium">
                  Posted {new Date(job.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>


            {/* Apply CTA - Centered */}
<div className="flex items-center justify-center gap-4 mt-6">
            {/* Apply Button */}
            <button 
              onClick={() => setShowApplicationForm(true)}
              className="beesee-button beesee-button--small flex items-center gap-2"
            >
              <Send size={18} />
              APPLY NOW
            </button>
            {/* Job ID */}
            <div className="inline-block px-5 py-2.5 rounded-lg" style={{
              border: '1px solid rgba(253, 204, 0, 0.35)',
              background: 'rgba(253, 204, 0, 0.1)'
            }}>
              <span className="bee-body-sm font-semibold" style={{ color: 'var(--beesee-gold)', fontSize: '15px' }}>
                Job ID: {job.job_reference_number}
              </span>
            </div>
          </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
        {/* About the Role Section */}
        <section className="mb-20 fade-up-init beesee-card-content1 text-left">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, rgba(253, 204, 0, 0.2), rgba(255, 215, 0, 0.1))',
              border: '2px solid rgba(253, 204, 0, 0.35)'
            }}>
              <Target size={26} style={{ color: 'var(--beesee-gold)' }} />
            </div>
            <h2 className="bee-title-md" style={{ color: 'var(--beesee-gold)' }}>
              About the Role
            </h2>
          </div>
          <div className="pl-0 md:pl-18">
            <p className="bee-body leading-relaxed" style={{ 
              fontSize: '18px',
              lineHeight: '1.8'
            }}>
              {job.description}
            </p>
          </div>
        </section>

   
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* What You'll Do (Responsibilities) */}
          <section className="fade-up-init beesee-card-content1 text-left h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(253, 204, 0, 0.2), rgba(255, 215, 0, 0.1))',
                border: '2px solid rgba(253, 204, 0, 0.35)'
              }}>
                <Users size={26} style={{ color: 'var(--beesee-gold)' }} />
              </div>
              <h2 className="bee-title-sm" style={{ color: 'var(--beesee-gold)' }}>
                What You'll Do
              </h2>
            </div>
            <ul className="space-y-5">
              {job.responsibilities.map((item, idx) => (
                <li key={idx} className="flex gap-4 group">
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight 
                      size={20} 
                      className="transition-transform group-hover:translate-x-1"
                      style={{ color: 'var(--beesee-gold)' }} 
                    />
                  </div>
                  <span className="bee-body" style={{ lineHeight: '1.7' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* What We're Looking For (Qualifications) */}
          <section className="fade-up-init beesee-card-content1 text-left h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(253, 204, 0, 0.2), rgba(255, 215, 0, 0.1))',
                border: '2px solid rgba(253, 204, 0, 0.35)'
              }}>
                <Award size={26} style={{ color: 'var(--beesee-gold)' }} />
              </div>
              <h2 className="bee-title-sm" style={{ color: 'var(--beesee-gold)' }}>
                What We're Looking For
              </h2>
            </div>
            <ul className="space-y-5">
              {job.qualifications.map((item, idx) => (
                <li key={idx} className="flex gap-4 group">
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight 
                      size={20} 
                      className="transition-transform group-hover:translate-x-1"
                      style={{ color: 'var(--beesee-gold)' }} 
                    />
                  </div>
                  <span className="bee-body" style={{ lineHeight: '1.7' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Final CTA Section */}
        <section className="fade-up-init text-center">
          <div 
            className="p-10 md:p-16 rounded-3xl"
            
          >
            <h2 className="bee-title-md mb-5" style={{ color: 'var(--beesee-gold)' }}>
              Ready to Join Our Team?
            </h2>
            <p className="bee-body mb-10 max-w-2xl mx-auto" style={{ fontSize: '17px' }}>
              Take the next step in your career journey and become part of our innovative, 
              collaborative team at BEESEE.
            </p>
            <button 
              onClick={() => setShowApplicationForm(true)}
              className="beesee-button beesee-button--small"
            >
              <Send size={18} />
              Submit Your Application
            </button>
          </div>
        </section>
      </div>

      {/* Application Form Modal */}
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

