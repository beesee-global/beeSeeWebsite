import React from 'react';
import { useParams } from 'react-router-dom';
import projects from '../../../../public/data/projects.json';

const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Project not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section
        className="h-[60vh] flex items-end"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.95)), url(${project.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="p-8 max-w-6xl mx-auto">
          <h1 className="bee-title-lg mb-4">{project.title}</h1>
          <p className="bee-body max-w-2xl">{project.description}</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 grid md:grid-cols-2 gap-12">

        {/* LEFT */}
        <div>
          <h2 className="bee-title-sm mb-6">Project Scope</h2>
          <ul className="space-y-4">
            {project.scope.map((item, i) => (
              <li key={i} className="bee-body">• {item}</li>
            ))}
          </ul>

          <h2 className="bee-title-sm mt-10 mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-3">
            {project.techStack.map((tech, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full bg-white/10 bee-body-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT – GALLERY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {project.gallery.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              loading="lazy"
              className="rounded-xl object-cover w-full h-[220px]"
            />
          ))}
        </div>

      </section>
    </div>
  );
};

export default ProjectDetails;
