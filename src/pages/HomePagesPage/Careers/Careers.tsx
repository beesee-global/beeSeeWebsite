import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobPostings } from '../../../services/Technician/careersServices'
import { useParams } from 'react-router-dom'; 

export interface JobPosting {
  job_reference_number: string;
  title: string; 
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  postedDate: string;
  description: string;
  careers_job_details: "string"  
  workLocation?: string;
} 

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