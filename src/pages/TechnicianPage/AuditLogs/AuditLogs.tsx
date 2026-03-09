import React from 'react'
import Breadcrumb from '../../../components/Navigation/Breadcrumbs'
import axiosClient from '../../../axiosClient'
import {
  Logs
} from 'lucide-react'
import { userAuth } from '../../../hooks/userAuth'
import { useQuery } from '@tanstack/react-query'
import TableAuditLogs from '../AuditLogs/components/TableAuditLogs'

const AuditLogs = () => {
  const { userInfo } = userAuth();

  const { data: auditLogsResponse, isLoading, error } = useQuery({
    queryKey: ["audit-logs", userInfo?.id],
    queryFn: async () => {
      const response = await axiosClient(`/audit_logs`);
      return response.data;
    }
  });

  const columns = [ 
    { id: 'user_name', label: 'User Name', sortable: false },
    { id: 'action', label: 'Action', sortable: false },
    { id: 'entity', label: 'Entity', sortable: false },
    { id: 'details', label: 'Details', sortable: false },
    { id: 'status_message', label: 'Status Message', sortable: false },
    { id: 'created_at', label: 'Timestamp', sortable: false }, 
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-10 bg-white"> 
       {/* Header - Responsive layout */}
      <div className='flex flex-col lg:grid lg:grid-cols-2 gap-4'>
        {/* Breadcrumb Section */}
        <div className="flex items-center w-full">
          <Breadcrumb 
            items={[
              { label: "Audit Logs", isActive: true, icon: <Logs className="w-4 h-4" /> }
            ]}
          />
        </div>  
      </div>

       {/* Table Section */}
        <TableAuditLogs
            rows={auditLogsResponse?.data || []}
            columns={columns}
            isLoading={isLoading} 
        />
    </div>
  )
}

export default AuditLogs
