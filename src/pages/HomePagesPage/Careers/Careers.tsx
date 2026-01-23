import React, { useState, useMemo } from 'react';
import { Briefcase, MapPin, Clock, Search, Filter, X, ChevronRight } from 'lucide-react';
import { careersList } from '../../../services/Technician/careersServices'
import { useQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'; 
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job, index }) => {

  // Sanitize HTML function
  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'i', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'b'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
      ALLOW_DATA_ATTR: false,
    })
  }

  const navigate = useNavigate();

  // Calculate time ago from created_at
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div
      className="beesee-card-content1 fade-up-init"
      style={{
        animationDelay: `${index * 0.1}s`,
        animation: 'fadeInUp 0.6s ease-out forwards',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    > 

      <div style={{ 
        position: 'relative', 
        zIndex: 3, 
        flex: 1 
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 className="beesee-card-content1-title" style={{ 
            marginBottom: '1rem',
            color: '#FDCC00',
            fontSize: '1.5rem',
            fontWeight: '600',
            lineHeight: '1.2'
          }}>
            {job.title}
          </h3>
        </div>
        
        <p className="bee-body1" style={{ 
          marginBottom: '1.5rem',
          color: 'var(--muted)',
          lineHeight: '1.6',
          fontSize: '0.95rem'
        }}
          dangerouslySetInnerHTML={{__html: sanitizeHTML(job.description)}}
        />
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          marginBottom: '1.5rem',
          alignItems: 'center'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.875rem',
            color: 'var(--muted)',
            padding: '0.5rem 0.875rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '6px'
          }}>
            <Briefcase size={16} style={{ color: 'var(--beesee-gold)' }} />
            BeeSee Global/{job.work_location}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.875rem',
            color: 'var(--muted)',
            padding: '0.5rem 0.875rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '6px'
          }}>
            <Clock size={16} style={{ color: 'var(--beesee-gold-soft)' }} />
            {job.job_type}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.875rem',
            color: 'var(--muted)',
            padding: '0.5rem 0.875rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '6px'
          }}>
            <MapPin size={16} style={{ color: 'var(--beesee-gold)' }} />
            {job.location}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          marginTop: 'auto'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span className="bee-body-sm" style={{ 
              opacity: 0.7,
              fontSize: '0.875rem',
              color: 'var(--muted)'
            }}>
              {getTimeAgo(job.created_at)}
            </span>
          </div>
          <button
            onClick={() => {
              navigate(`/bsg/career/${job.job_reference_number}`)
            }} 
            className="beesee-button beesee-button--small" style={{
              padding: '0.625rem 1.25rem',
              fontWeight: '500'
            }}
          >
            View Details
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const CareerPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const { data: careerResponse  } = useQuery({
    queryKey: ['careers'],
    queryFn: () => careersList()
  })

  const jobData = careerResponse?.data ?? []

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobData.filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [searchTerm, jobData]);

  const clearFilters = () => {
    setSearchTerm('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000' }}>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'url(/live-background/download.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '6rem 1rem',
        borderBottom: '2px solid #FDCC00'
      }}>
        {/* Black overlay with gradient fade */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9))',
          zIndex: 1
        }} />
  

        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          maxWidth: '72rem', 
          margin: '0 auto', 
          textAlign: 'center' 
        }}>
          
          <h1 className="bee-title-lg" style={{ 
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.6s ease-out 0.1s both',
            color: '#FDCC00',
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            lineHeight: '1.1'
          }}>
            Build Your Career<br />With Beesee
          </h1>
          
          <p className="bee-body" style={{ 
            maxWidth: '42rem', 
            margin: '0 auto 2.5rem',
            animation: 'fadeInUp 0.6s ease-out 0.2s both',
            fontSize: '1.125rem',
            lineHeight: '1.6',
            color: 'var(--muted)'
          }}>
            Discover opportunities to work with talented people on meaningful projects that make a difference.
          </p>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '2rem',
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.6s ease-out 0.3s both'
          }}>
            
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div style={{ 
        maxWidth: '72rem', 
        margin: '0 auto', 
        padding: '0 1rem', 
        transform: 'translateY(-2rem)',
        position: 'relative',
        zIndex: 20
      }}>
        <div style={{
          background: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid rgba(253, 204, 0, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          animation: 'fadeInUp 0.6s ease-out 0.4s both'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            gap: '1rem'
          }}>
            {/* Search */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Search 
                style={{
                  position: 'absolute',
                  left: '1.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)',
                  pointerEvents: 'none'
                }} 
                size={20} 
              />
              <input
                type="text"
                placeholder="Search jobs by title or keyword..."
                className="input-default"
                style={{ 
                  padding: '1rem 1rem 1rem 3.5rem',
                  fontSize: '1rem',
                  width: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--muted)'
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div style={{ 
        maxWidth: '72rem', 
        margin: '0 auto', 
        padding: '3rem 1rem 5rem'
      }}>
        <div style={{ 
          marginBottom: '2.5rem',
          padding: '0 0.5rem'
        }}>
          <h2 className="bee-title-md" style={{ 
            color: '#FDCC00',
            fontSize: '2rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            {filteredJobs.length} Open Position{filteredJobs.length !== 1 ? 's' : ''}
          </h2>
          <p style={{
            color: 'var(--muted)',
            fontSize: '1rem',
            margin: 0
          }}>
            Find your perfect role in our growing team
          </p>
        </div>

        {filteredJobs.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginTop: '2rem'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '1.5rem',
              background: 'rgba(253, 204, 0, 0.1)',
              borderRadius: '50%',
              marginBottom: '1.5rem',
              border: '1px solid rgba(253, 204, 0, 0.2)'
            }}>
              <Briefcase size={48} style={{ color: '#FDCC00' }} />
            </div>
            <h3 className="bee-title-sm" style={{ 
              marginBottom: '0.75rem', 
              color: '#FDCC00',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              No jobs found
            </h3>
            <p className="bee-body" style={{ 
              marginBottom: '1.5rem',
              fontSize: '1rem',
              color: 'var(--muted)',
              maxWidth: '28rem',
              margin: '0 auto'
            }}>
              Try adjusting your search or filters to find what you're looking for
            </p>
            <button onClick={clearFilters} className="beesee-button beesee-button--small" style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem'
            }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
            gap: '2rem'
          }}>
            {filteredJobs.map((job, index) => (
              <JobCard key={index} job={job} index={index} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CareerPage;