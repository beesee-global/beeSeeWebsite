import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter, X } from 'lucide-react';
import ProjectCard from '../Projects/components/ProjectCard';
import projects from '../Projects/components/mockProjects.json';

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  /* ===========================
     FILTERS / SORT / PAGINATION
  ============================ */
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [techFilter, setTechFilter] = useState("");
  const [sortBy, setSortBy] = useState("year-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique years and tech stack options
  const availableYears = useMemo(() => {
    const years = [...new Set(projects.map(project => project.year))].sort((a, b) => b.localeCompare(a));
    return years;
  }, []);

  const availableTech = useMemo(() => {
    const allTech = projects.flatMap(project => project.techStack);
    return [...new Set(allTech)].sort();
  }, []);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    
    return projects.filter((project) => {
      const matchSearch = !q ||
        project.title.toLowerCase().includes(q) ||
        project.subtitle.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.techStack.some(tech => tech.toLowerCase().includes(q)) ||
        project.scope.some(item => item.toLowerCase().includes(q));

      const matchYear = !yearFilter || project.year === yearFilter;
      const matchTech = !techFilter || project.techStack.includes(techFilter);

      return matchSearch && matchYear && matchTech;
    });
  }, [searchQuery, yearFilter, techFilter]);

  const sortedProjects = useMemo(() => {
    let arr = [...filteredProjects];
    
    if (sortBy === "year-desc") arr.sort((a, b) => b.year.localeCompare(a.year));
    if (sortBy === "year-asc") arr.sort((a, b) => a.year.localeCompare(b.year));
    if (sortBy === "name-asc") arr.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "name-desc") arr.sort((a, b) => b.title.localeCompare(a.title));
    
    return arr;
  }, [sortBy, filteredProjects]);

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setYearFilter("");
    setTechFilter("");
    setSortBy("year-desc");
    setCurrentPage(1);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, yearFilter, techFilter, sortBy]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to projects grid
    const projectsGrid = document.querySelector('.projects-grid-container');
    if (projectsGrid) {
      projectsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPrevPage = () => goToPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => goToPage(Math.min(totalPages, currentPage + 1));

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO SECTION */}
      <section
        className="relative h-[65vh] flex items-center justify-center"
        style={{
          background:
            'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url("/careerBg3.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-center px-4 max-w-4xl">
          <motion.h1 
            className="bee-title-xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Company Projects
          </motion.h1>
          <motion.p 
            className="bee-body max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            A portfolio of enterprise-level systems and platforms developed
            collaboratively by our teams. Browse our innovative solutions and cutting-edge technologies.
          </motion.p>
        </div>
      </section>

      {/* FILTERS & CONTROLS SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col gap-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects by title, description, or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FDCC00]/50 focus:ring-1 focus:ring-[#FDCC00]/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filter Toggle for Mobile */}
            {isMobile && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Filter size={18} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            )}

            {/* Filters (Always visible on desktop, conditionally on mobile) */}
            <div className={`flex-1 flex flex-col md:flex-row gap-4 ${isMobile && !showFilters ? 'hidden' : 'flex'}`}>
              {/* Year Filter */}
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FDCC00]/50 focus:ring-1 focus:ring-[#FDCC00]/30 transition-all"
              >
                <option value="">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Technology Filter */}
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FDCC00]/50 focus:ring-1 focus:ring-[#FDCC00]/30 transition-all"
              >
                <option value="">All Technologies</option>
                {availableTech.map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FDCC00]/50 focus:ring-1 focus:ring-[#FDCC00]/30 transition-all"
              >
                <option value="year-desc">Year: Newest First</option>
                <option value="year-asc">Year: Oldest First</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>

              {/* Clear Filters Button */}
              {(searchQuery || yearFilter || techFilter || sortBy !== "year-desc") && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="bee-body-sm text-[#C7B897]">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
            {searchQuery && ` for "${searchQuery}"`}
            {yearFilter && ` in ${yearFilter}`}
            {techFilter && ` using ${techFilter}`}
          </div>
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 projects-grid-container">
        {paginatedProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {paginatedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col gap-4">
                <div className="bee-body-sm text-[#C7B897] text-center">
                  Page {currentPage} of {totalPages} • {filteredProjects.length} projects
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  {/* First Page */}
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="First page"
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = isMobile ? 3 : 5;
                    
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    // First page with ellipsis if needed
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === 1 
                              ? 'bg-[#FDCC00] text-black font-medium' 
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          1
                        </button>
                      );
                      
                      if (startPage > 2) {
                        pages.push(
                          <div key="ellipsis-start" className="px-2 text-[#C7B897]">
                            ...
                          </div>
                        );
                      }
                    }

                    // Page numbers
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => goToPage(i)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === i 
                              ? 'bg-[#FDCC00] text-black font-medium' 
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Last page with ellipsis if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <div key="ellipsis-end" className="px-2 text-[#C7B897]">
                            ...
                          </div>
                        );
                      }
                      
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === totalPages 
                              ? 'bg-[#FDCC00] text-black font-medium' 
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}

                  {/* Next Page */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Last page"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-[#C7B897] bee-title-md mb-4">No projects found</div>
            <p className="bee-body text-gray-400 mb-6">
              Try adjusting your search filters or browse all projects
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-[#FDCC00] text-black font-medium rounded-lg hover:bg-[#F0C000] transition-colors"
            >
              View All Projects
            </button>
          </div>
        )}
      </section>

    </div>
  );
};

export default Projects;