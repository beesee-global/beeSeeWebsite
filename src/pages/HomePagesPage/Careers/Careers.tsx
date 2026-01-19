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

// this is data for careers page 
// data: [
//     {
//         "title": "Sales Marketing",
//         "description": "As a Sales Marketing Professional, You'll be promoting a range of tech devices such as Laptops, Tablets, digital Kiosks, interactive Boards, and smart Displays, along with IT services like CCTV installation and network system Setup. You'll help businesses upgrade their Technology, connect with Clients, and deliver smarter Solutions. Testing.",
//         "job_type": "Full-time",
//         "location": "South Triangle, Quezon City",
//         "work_location": "Onsite",
//         "created_at": "2026-01-19T02:37:56.000Z"
//     },
//     {
//         "title": "Sales Graphic",
//         "description": "As a Sales Graphic, you’ll be promoting a range of tech innovative devices, along with IT digital solution services. You’ll help businesses upgrade their technology, connect with clients, and deliver smarter solutions.",
//         "job_type": "Full-time",
//         "location": "South Triangle, Quezon City",
//         "work_location": "Onsite",
//         "created_at": "2026-01-14T05:53:56.000Z"
//     }
//   ]

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