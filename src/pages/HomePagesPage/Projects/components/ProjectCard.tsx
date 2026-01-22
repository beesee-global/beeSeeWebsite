import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  year: string;
}

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="relative h-[380px] rounded-2xl overflow-hidden cursor-pointer group"
      whileHover={{ scale: 1.03 }}
    >
      {/* BG IMAGE */}
      <img
        src={project.coverImage}
        alt={project.title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-all" />

      {/* CONTENT */}
      <div className="relative z-10 h-full p-6 flex flex-col justify-end">
        <div className="flex items-center gap-3 mb-3">
          <Briefcase size={22} />
          <span className="bee-body-sm">{project.year}</span>
        </div>

        <h3 className="bee-title-sm mb-2">{project.title}</h3>
        <p className="bee-body-sm opacity-80">{project.subtitle}</p>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
