import React from 'react';

const Hero = ({ company }: any) => {
  return (
    <section
      className="relative h-[75vh] flex items-center justify-center"
      style={{
        background: `linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0)), url("${company.heroBackground}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000]/20 to-[#000]" />

      <div className="relative z-10 text-center max-w-4xl px-6">
        <h1
          className="mb-6"
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 'clamp(48px, 10vw, 120px)',
            letterSpacing: '0.04em',
            color: 'var(--beesee-light)'
          }}
        >
          PROJECTS
        </h1>

        <p className="bee-body max-w-2xl mx-auto text-[16px] md:text-[18px]">
          A curated portfolio of enterprise systems, platforms, and digital solutions
          developed by {company.name}.
        </p>
      </div>
    </section>
  );
};

export default Hero;
