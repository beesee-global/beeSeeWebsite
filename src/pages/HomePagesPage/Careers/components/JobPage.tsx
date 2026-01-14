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
  Send
} from 'lucide-react';
import Apply from './Apply';

interface JobPosting {
  job_reference_number: string;
  title: string; 
  location: string;
  job_type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
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

  return (
    <div className="job-page min-h-screen bg-[#000] text-white overflow-x-hidden">
      
      {/* HERO SECTION */}
      <div 
        className="relative h-[75vh] md:h-[80vh] overflow-hidden flex items-center justify-center"
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

          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-20">

        {/* ABOUT */}
        <section className="mb-16 md:mb-20 fade-up-init beesee-card-content1 text-left">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div
              className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(253, 204, 0, 0.2), rgba(255, 215, 0, 0.1))',
                border: '2px solid rgba(253, 204, 0, 0.35)'
              }}
            >
              <Target size={24} style={{ color: 'var(--beesee-gold)' }} />
            </div>
            <h2 className="bee-title-md" style={{ color: 'var(--beesee-gold)' }}>
              About the Role
            </h2>
          </div>

          <p className="bee-body leading-relaxed text-[16px] md:text-[18px]">
            {job.description}
          </p>
        </section>

        {/* RESPONSIBILITIES & QUALIFICATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-20">
          {[{
            title: "What You'll Do",
            icon: <Users size={26} style={{ color: 'var(--beesee-gold)' }} />,
            data: job.responsibilities
          },{
            title: "What We're Looking For",
            icon: <Award size={26} style={{ color: 'var(--beesee-gold)' }}  />,
            data: job.qualifications
          }].map((block, idx) => (
            <section key={idx} className="fade-up-init beesee-card-content1 text-left">
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(253, 204, 0, 0.2), rgba(255, 215, 0, 0.1))',
                    border: '2px solid rgba(253, 204, 0, 0.35)'
                  }}
                >
                  {block.icon}
                </div>
                <h2 className="bee-title-sm" style={{ color: 'var(--beesee-gold)' }}>
                  {block.title}
                </h2>
              </div>

              <ul className="space-y-5">
                {block.data.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <ChevronRight size={20} style={{ color: 'var(--beesee-gold)' }} />
                    <span className="bee-body leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

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
            className="beesee-button beesee-button--small"
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
