import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobPostings } from '../../../services/Technician/careers'
import { useParams } from 'react-router-dom';

export interface JobPosting {
  job_reference_number: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  postedDate: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  salary?: string;
  workLocation?: string;
}

// ========================================
// MOCK DATA 
// ========================================
/* export const mockJobData: JobPosting = {
  id: 'BSG2025001',
  title: 'Sales and Marketing',
  department: 'Sales & Marketing',
  location: 'South Triangle, Quezon City',
  workLocation: 'Onsite',
  type: 'Full-time', 
  description: "As a Sales and Marketing professional, you'll be promoting a range of tech devices such as laptops, tablets, digital kiosks, interactive boards, and smart displays, along with IT services like CCTV installation and network system setup. You'll help businesses upgrade their technology, connect with clients, and deliver smarter solutions.",
  responsibilities: [
    'Develop and implement marketing strategies tailored to IT devices and services',
    'Conduct market research and competitor analysis to identify business opportunities',
    'Create and manage marketing campaigns across digital and traditional platforms',
    'Generate and follow up on leads, prepare proposals, and negotiate sales contracts',
    'Coordinate with the technical team to ensure accurate product/service information is conveyed to clients',
    'Represent the company in client meetings, trade shows, and product demonstrations',
    'Prepare sales forecasts, reports, and presentations for management',
    'Collaborate with management to design promotional materials and campaigns that align with company goals',
    'Provide after-sales support and maintain strong client relationships for repeat business'
  ],
  qualifications: [
    "Bachelor's Degree in Business Administration, Marketing, IT, or related fields",
    'Experience in sales, marketing, business development, or technical support',
    'Familiar with laptops, tablets, digital displays, or IT services',
    'Confident communicator with strong presentation and persuasion skills',
    'MS Office proficiency, especially Excel and PowerPoint',
    'Strong organization and time management skills',
    'Creative thinker with knowledge of digital marketing tools',
    'Understanding of digital marketing and online sales strategies is a plus',
    'Motivated, results-oriented, and enjoys working with technology'
  ],

}; */

import JobPage from '../Careers/components/JobPage';

const Career: React.FC = () => {

  const { job_ref } = useParams<{ job_ref: string }>();

  // In a real application, you would fetch the job data using the job_ref
  const { data: jobData} = useQuery<JobPosting>({
    queryKey: ['jobPosting', job_ref],
    queryFn: () => getJobPostings(String(job_ref)),
    enabled: !!job_ref,
  });

  if (!jobData) {
    return <div>Loading...</div>;
  }

  return <JobPage job={jobData} />;
};

export default Career;