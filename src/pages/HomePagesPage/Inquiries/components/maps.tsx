import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

const BeeSeeMapSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const mapRef = React.useRef(null);
  const inViewMap = useInView(mapRef, { amount: 0.25 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // BeeSee Global Technologies coordinates
  const location = {
    address: "#65-D Scout Borromeo, South Triangle, Quezon City",
    lat: 14.6333,
    lng: 121.0333,
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=65-D+Scout+Borromeo+Street+South+Triangle+Quezon+City"
  };

  // Google Maps Embed URL without API key
  const embedUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}&t=&z=17&ie=UTF8&iwloc=&output=embed`;

  const MapContent = () => (
    <div className="beesee-card-content" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Map Header */}
      <div style={{ padding: '1.5rem', background: 'rgba(0, 0, 0, 0.3)' }}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div 
              className="icon-wrap" 
              style={{ 
                width: '48px', 
                height: '48px', 
                margin: 0,
                background: 'rgba(253, 204, 0, 0.15)',
                border: '2px solid var(--beesee-gold)'
              }}
            >
              <MapPin size={24} style={{ color: 'var(--beesee-gold)' }} />
            </div>
            <div>
              <h3 className="bee-title-sm" style={{ marginBottom: '0.25rem', color: 'var(--beesee-gold)', fontSize: '24px' }}>
                Our Location
              </h3>
              <p className="bee-body-sm" style={{ color: 'var(--muted)', margin: 0 }}>
                Visit us at our office
              </p>
            </div>
          </div>
          <a
            href={location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300"
            style={{
              background: 'rgba(253, 204, 0, 0.1)',
              border: '1px solid rgba(253, 204, 0, 0.3)',
              color: 'var(--beesee-gold)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(253, 204, 0, 0.2)';
              e.currentTarget.style.borderColor = 'var(--beesee-gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(253, 204, 0, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(253, 204, 0, 0.3)';
            }}
          >
            <span>Open in Maps</span>
            <ExternalLink size={16} />
          </a>
        </div>
        <p className="bee-body-sm" style={{ color: 'var(--text-light)', margin: 0 }}>
          {location.address}
        </p>
      </div>

      {/* Map Embed */}
      <div style={{ position: 'relative', width: '100%', height: '450px', background: '#1a1a1a' }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="BeeSee Global Technologies Location"
        />
      </div>

      {/* Quick Info Footer */}
      <div 
        style={{ 
          padding: '1.25rem 1.5rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderTop: '1px solid rgba(253, 204, 0, 0.15)'
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="bee-body-sm" style={{ color: 'var(--muted)', marginBottom: '0.25rem', fontSize: '12px' }}>
              BUSINESS HOURS
            </p>
            <p className="bee-body-sm" style={{ color: 'var(--text-light)', margin: 0, fontWeight: '600' }}>
              Mon - Fri: 9AM - 6PM
            </p>
          </div>
          <div>
            <p className="bee-body-sm" style={{ color: 'var(--muted)', marginBottom: '0.25rem', fontSize: '12px' }}>
              PHONE
            </p>
            <p className="bee-body-sm" style={{ color: 'var(--text-light)', margin: 0, fontWeight: '600' }}>
              +63 927 609 3575
            </p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="bee-body-sm" style={{ color: 'var(--muted)', marginBottom: '0.25rem', fontSize: '12px' }}>
              EMAIL
            </p>
            <p className="bee-body-sm" style={{ color: 'var(--text-light)', margin: 0, fontWeight: '600' }}>
              info@beese.ph
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto mt-12 sm:mt-16">
      {isMobile ? (
        <MapContent />
      ) : (
        <motion.div
          ref={mapRef}
          initial={{ opacity: 0, y: 50 }}
          animate={inViewMap ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <MapContent />
        </motion.div>
      )}
    </div>
  );
};

export default BeeSeeMapSection;