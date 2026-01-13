import React from 'react'
import Breadcrumb from '../../../components/Navigation/Breadcrumbs'
import { 
  useQuery, 
  useMutation, 
  useQueryClient  
} from '@tanstack/react-query';
import {
  FileUser
} from 'lucide-react'
import WorkIcon from '@mui/icons-material/Work';

const Careers = () => {
  return (
    <div className='p-6 space-y-0 bg-white'>
        <div className='grid md:grid-cols-2'>
          <div className='flex items-center'>
            <Breadcrumb 
              items={[
                { label: "Job Order", href: "/beesee/job-order", icon: <WorkIcon className="w-4 h-4"/> }, 
                { label: 'Careers', isActive: true, icon: <FileUser className='w-4 h-4' /> },
              ]}
            />
          </div>
        </div>
    </div>
  )
}

export default Careers
