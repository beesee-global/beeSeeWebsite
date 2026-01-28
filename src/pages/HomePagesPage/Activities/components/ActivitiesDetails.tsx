import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, Users, ZoomIn, ZoomOut, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

interface ActivityDetailsProps {
  id?: string; // Optional prop for direct usage
}

const ActivitiesDetails: React.FC<ActivityDetailsProps> = ({ id: propId }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activityId = propId || paramId || "christmas-2024";
  
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ACTIVITIES DATA - Connected to ActivitiesCard.tsx
  const activitiesData = {
    "christmas-2024": {
      id: "christmas-2024",
      title: "Christmas Celebration 2024",
      date: "December 25, 2024",
      location: "BeeSee Global Technologies HQ",
      participants: "120+ Team Members",
      description: "Our annual Christmas celebration brought together the entire BeeSee family for an unforgettable evening of joy, gratitude, and togetherness. The event featured a spectacular holiday feast, exciting gift exchanges, heartwarming performances, and a special recognition ceremony honoring our team's achievements throughout the year.",
      highlights: [
        "Traditional Christmas dinner with international cuisine",
        "Secret Santa gift exchange activity",
        "Awards ceremony recognizing outstanding team members",
        "Live musical performances and carol singing",
        "Photo booth with festive props and decorations"
      ],
      photos: [
        { id: "1", url: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=80", caption: "The festive dining hall adorned with golden decorations" },
        { id: "2", url: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&q=80", caption: "Team members enjoying the holiday feast" },
        { id: "3", url: "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=1200&q=80", caption: "Secret Santa gift exchange bringing smiles" },
        { id: "4", url: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1200&q=80", caption: "Awards ceremony recognizing excellence" },
        { id: "5", url: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&q=80", caption: "Live musical performance lighting up the night" },
        { id: "6", url: "https://images.unsplash.com/photo-1545911825-6bfa5b0c34a9?w=1200&q=80", caption: "Team photo capturing the joy of togetherness" },
        { id: "7", url: "https://images.unsplash.com/photo-1544121985-98d3e3320f0f?w=1200&q=80", caption: "Dessert table with festive treats" },
        { id: "8", url: "https://images.unsplash.com/photo-1577222413728-9aa0c5dc1ec4?w=1200&q=80", caption: "Photo booth moments filled with laughter" },
        { id: "9", url: "https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=1200&q=80", caption: "Christmas tree lighting ceremony" },
        { id: "10", url: "https://images.unsplash.com/photo-1478144592103-25e218a04891?w=1200&q=80", caption: "The golden glow of holiday spirit" },
        { id: "11", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80", caption: "Candid moments of celebration" },
        { id: "12", url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80", caption: "Closing remarks and holiday wishes" },
      ]
    },
    "tech-summit-2024": {
      id: "tech-summit-2024",
      title: "Tech Innovation Summit 2024",
      date: "November 15, 2024",
      location: "Tech Convention Center, Makati",
      participants: "80+ Industry Leaders",
      description: "BeeSee Global Technologies hosted its annual Tech Innovation Summit, bringing together industry pioneers, startup founders, and technology enthusiasts. The summit featured keynote speeches, panel discussions, and live demonstrations of cutting-edge technologies including AI, blockchain, and IoT solutions.",
      highlights: [
        "Keynote speech by renowned AI researcher Dr. Sarah Chen",
        "Live demonstration of BeeSee's new blockchain platform",
        "Startup pitch competition with ₱500,000 prize pool",
        "Networking session with tech investors and venture capitalists",
        "Exhibition of emerging technologies from local startups"
      ],
      photos: [
        { id: "1", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80", caption: "Opening ceremony with keynote speakers" },
        { id: "2", url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80", caption: "Panel discussion on AI ethics and implementation" },
        { id: "3", url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80", caption: "Live coding workshop for participants" },
        { id: "4", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80", caption: "Networking session over coffee breaks" },
        { id: "5", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80", caption: "Startup exhibition area" },
        { id: "6", url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80", caption: "Awarding ceremony for pitch competition winners" },
      ]
    },
    "team-building-2024": {
      id: "team-building-2024",
      title: "Annual Team Building Retreat",
      date: "October 10-12, 2024",
      location: "Pico de Loro Beach Resort, Batangas",
      participants: "All BeeSee Department Teams",
      description: "A three-day retreat focused on strengthening team bonds, improving communication, and fostering collaboration across departments. Through outdoor adventures, team challenges, and reflective sessions, we built stronger connections and developed strategies for better workplace synergy.",
      highlights: [
        "Beach volleyball tournament and water sports",
        "Problem-solving escape room challenges",
        "Leadership workshop and trust-building exercises",
        "Bonfire night with team sharing sessions",
        "Strategic planning for Q4 projects"
      ],
      photos: [
        { id: "1", url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80", caption: "Team building exercises on the beach" },
        { id: "2", url: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=1200&q=80", caption: "Group problem-solving challenge" },
        { id: "3", url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80", caption: "Beach volleyball tournament finals" },
        { id: "4", url: "https://images.unsplash.com/photo-1549109786-eb80da56e693?w=1200&q=80", caption: "Sunset bonfire and sharing session" },
        { id: "5", url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=80", caption: "Team dinner with awards ceremony" },
        { id: "6", url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&q=80", caption: "Group photo at the resort entrance" },
      ]
    },
    "training-workshop-sept": {
      id: "training-workshop-sept",
      title: "ICT Training Workshop",
      date: "September 20-22, 2024",
      location: "BeeSee Training Center, BGC",
      participants: "45+ IT Professionals",
      description: "A comprehensive three-day workshop designed to upskill IT professionals in the latest technologies and methodologies. The training covered full-stack development, cloud computing, cybersecurity best practices, and agile project management techniques.",
      highlights: [
        "Hands-on coding sessions with expert mentors",
        "Cloud infrastructure deployment workshop",
        "Cybersecurity threat simulation exercises",
        "Agile methodology and Scrum certification",
        "Career development and tech roadmap planning"
      ],
      photos: [
        { id: "1", url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80", caption: "Opening session and workshop overview" },
        { id: "2", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80", caption: "Hands-on coding workshop" },
        { id: "3", url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80", caption: "One-on-one mentoring sessions" },
        { id: "4", url: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=1200&q=80", caption: "Group project presentations" },
        { id: "5", url: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&q=80", caption: "Certificate awarding ceremony" },
        { id: "6", url: "https://images.unsplash.com/photo-1524178234883-043d5c3f3cf4?w=1200&q=80", caption: "Networking lunch with participants" },
      ]
    },
    "community-outreach": {
      id: "community-outreach",
      title: "Community Tech Outreach",
      date: "August 5-7, 2024",
      location: "Barangay Tatalon, Quezon City",
      participants: "BeeSee Volunteers & Community Members",
      description: "A three-day community outreach program aimed at bringing technology education to underserved communities. We conducted workshops, donated computers, and provided IT training to students, teachers, and local entrepreneurs to help bridge the digital divide.",
      highlights: [
        "Basic computer literacy workshops for students",
        "Digital skills training for local entrepreneurs",
        "Donation of 20 computer sets to the barangay learning center",
        "Internet safety and cybersecurity awareness seminar",
        "Mentorship program for aspiring IT students"
      ],
      photos: [
        { id: "1", url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80", caption: "Opening ceremony with community leaders" },
        { id: "2", url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80", caption: "Computer literacy workshop for students" },
        { id: "3", url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&q=80", caption: "Donation of computer equipment" },
        { id: "4", url: "https://images.unsplash.com/photo-1522881193457-37ae97c905bf?w=1200&q=80", caption: "Entrepreneurship and digital marketing seminar" },
        { id: "5", url: "https://images.unsplash.com/photo-1531204420596-56c3dbf4f81f?w=1200&q=80", caption: "Group photo with community members" },
        { id: "6", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80", caption: "One-on-one mentorship sessions" },
      ]
    },
    "launch-event": {
      id: "launch-event",
      title: "Product Launch Event",
      date: "July 12, 2024",
      location: "Grand Ballroom, Shangri-La Hotel",
      participants: "200+ Clients & Partners",
      description: "The grand unveiling of BeeSee's revolutionary new platform - Nexus Enterprise Suite. The event showcased our latest innovation in enterprise solutions, featuring AI-powered analytics, seamless integration capabilities, and next-generation security features.",
      highlights: [
        "Live demonstration of Nexus Enterprise Suite",
        "Client testimonials and success stories",
        "Exclusive preview for premium partners",
        "Technology roadmap presentation",
        "Networking cocktail reception"
      ],
      photos: [
        { id: "1", url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80", caption: "Grand entrance and registration area" },
        { id: "2", url: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=1200&q=80", caption: "CEO unveiling the new platform" },
        { id: "3", url: "https://images.unsplash.com/photo-1556761175-4b1d2436a8b7?w=1200&q=80", caption: "Live product demonstration" },
        { id: "4", url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80", caption: "Client testimonials session" },
        { id: "5", url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80", caption: "Networking and partnership discussions" },
        { id: "6", url: "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=1200&q=80", caption: "Closing ceremony and toast to success" },
      ]
    }
  };

  const activityData = activitiesData[activityId as keyof typeof activitiesData] || activitiesData["christmas-2024"];

  const openLightbox = (index: number) => {
    setSelectedPhoto(index);
    setZoomLevel(1);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    setZoomLevel(1);
    document.body.style.overflow = "";
  };

  const goToPrevious = () => {
    if (selectedPhoto !== null && selectedPhoto > 0) {
      setSelectedPhoto(selectedPhoto - 1);
      setZoomLevel(1);
    }
  };

  const goToNext = () => {
    if (selectedPhoto !== null && selectedPhoto < activityData.photos.length - 1) {
      setSelectedPhoto(selectedPhoto + 1);
      setZoomLevel(1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhoto === null) return;
      
      switch(e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activityId]);

  return (
    <div className="relative bg-[#000000] min-h-screen w-full overflow-x-hidden">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleBackClick}
        className="fixed top-6 left-6 z-40 flex items-center gap-2 px-4 py-2 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-lg border border-[var(--beesee-gold)]/40 hover:bg-[var(--beesee-gold)]/30 transition-all text-[var(--beesee-gold)]"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back to Activities</span>
      </motion.button>

      {/* HEADER SECTION */}
      <section className="relative min-h-[60vh] flex items-end justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={activityData.photos[0].url} 
            alt={activityData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        </div>

        {/* GOLD FADE */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(253, 204, 0, 0.15) 0%,
                rgba(253, 204, 0, 0.08) 30%,
                rgba(253, 204, 0, 0.00) 60%
              )
            `,
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12 pb-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="bee-title-lg text-[var(--beesee-gold)] gold-glow mb-6">
              {activityData.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--beesee-gold)]/10 backdrop-blur-sm rounded-lg border border-[var(--beesee-gold)]/30">
                <Calendar size={18} className="text-[var(--beesee-gold)]" />
                <span className="text-sm text-[#C7B897]">{activityData.date}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--beesee-gold)]/10 backdrop-blur-sm rounded-lg border border-[var(--beesee-gold)]/30">
                <MapPin size={18} className="text-[var(--beesee-gold)]" />
                <span className="text-sm text-[#C7B897]">{activityData.location}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--beesee-gold)]/10 backdrop-blur-sm rounded-lg border border-[var(--beesee-gold)]/30">
                <Users size={18} className="text-[var(--beesee-gold)]" />
                <span className="text-sm text-[#C7B897]">{activityData.participants}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DESCRIPTION SECTION */}
      <section className="relative py-16 md:py-20 px-6 md:px-10 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left - Description */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="bee-title-sm text-[var(--beesee-gold)] mb-6">About This Event</h3>
              <p className="bee-body text-[#e8e8e8] leading-relaxed mb-6">
                {activityData.description}
              </p>
            </motion.div>

            {/* Right - Highlights */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="bee-title-sm text-[var(--beesee-gold)] mb-6">Event Highlights</h3>
              <ul className="space-y-4">
                {activityData.highlights.map((highlight, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 bg-[var(--beesee-gold)] rounded-full mt-2 flex-shrink-0" />
                    <span className="bee-body text-[#C7B897]">{highlight}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PHOTO GALLERY SECTION */}
      <section className="relative py-12 px-6 md:px-10 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow mb-4">Photo Gallery</h3>
            <p className="bee-body text-[#C7B897]">
              {activityData.photos.length} photos capturing unforgettable moments
            </p>
          </motion.div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activityData.photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
                </div>
                {/* Gold border on hover */}
                <div className="absolute inset-0 border-2 border-[var(--beesee-gold)]/0 group-hover:border-[var(--beesee-gold)]/60 rounded-lg transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX / IMAGE VIEWER */}
      <AnimatePresence>
        {selectedPhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 right-6 z-50 p-3 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/40 hover:bg-[var(--beesee-gold)]/30 transition-all"
              onClick={closeLightbox}
            >
              <X className="text-[var(--beesee-gold)]" size={24} />
            </motion.button>

            {/* Controls Bar - Top */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 left-6 z-50 flex items-center gap-3"
            >
              <button
                className="p-3 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/40 hover:bg-[var(--beesee-gold)]/30 transition-all"
                onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="text-[var(--beesee-gold)]" size={20} />
              </button>
              <button
                className="p-3 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/40 hover:bg-[var(--beesee-gold)]/30 transition-all"
                onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="text-[var(--beesee-gold)]" size={20} />
              </button>
              <div className="px-4 py-2 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/40">
                <span className="text-[var(--beesee-gold)] text-sm font-medium">
                  {selectedPhoto + 1} / {activityData.photos.length}
                </span>
              </div>
            </motion.div>

            {/* Previous Button */}
            {selectedPhoto > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute left-6 z-50 p-4 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/40 hover:bg-[var(--beesee-gold)]/30 transition-all"
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              >
                <ChevronLeft className="text-[var(--beesee-gold)]" size={32} />
              </motion.button>
            )}

            {/* Next Button */}
            {selectedPhoto < activityData.photos.length - 1 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-6 z-50 p-4 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/40 hover:bg-[var(--beesee-gold)]/30 transition-all"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
              >
                <ChevronRight className="text-[var(--beesee-gold)]" size={32} />
              </motion.button>
            )}

            {/* Image Container */}
            <motion.div
              key={selectedPhoto}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                src={activityData.photos[selectedPhoto].url}
                alt={activityData.photos[selectedPhoto].caption}
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{ scale: zoomLevel }}
                transition={{ duration: 0.3 }}
                drag={zoomLevel > 1}
                dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                dragElastic={0.1}
              />
            </motion.div>

            {/* Caption */}
            {activityData.photos[selectedPhoto].caption && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl px-6 py-4 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-xl border border-[var(--beesee-gold)]/40"
              >
                <p className="text-[#C7B897] text-center text-sm md:text-base">
                  {activityData.photos[selectedPhoto].caption}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        :root {
          --beesee-gold: #FDCC00;
        }

        .bee-title-lg {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 400;
          letter-spacing: 0.05em;
          line-height: 1.1;
        }

        .bee-title-md {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 400;
          letter-spacing: 0.05em;
          line-height: 1.1;
        }

        .bee-title-sm {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 400;
          letter-spacing: 0.05em;
        }

        .bee-body {
          font-family: Georgia, serif;
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          line-height: 1.7;
        }

        .gold-glow {
          text-shadow: 0 0 20px rgba(253, 204, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ActivitiesDetails;